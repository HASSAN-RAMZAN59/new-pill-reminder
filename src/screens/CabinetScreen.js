import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { StorageService } from '../services/StorageService';
import NotificationService from '../services/NotificationService';
import CustomModal from '../components/CustomModal';

import PillSvg from '../assets/add med/Container (2).svg';
import LiquidSvg from '../assets/add med/Container (3).svg';
import InjectionSvg from '../assets/add med/Container (4).svg';

const CabinetScreen = ({ navigation }) => {
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({ refillReminders: true });
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('Default');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [hasViewedNotifs, setHasViewedNotifs] = useState(false);

  const loadNotifications = useCallback(() => {
    const alerts = [];
    const todayStr = new Date().toISOString().split('T')[0];
    
    const daily = StorageService.getDailySchedules(todayStr);
    daily.forEach(item => {
      if (item.status === 'Missed') {
        alerts.push({
          title: 'Missed Dose',
          message: `You missed ${item.name} at ${item.expectedTime}.`
        });
      }
    });

    const meds = StorageService.getMedicines();
    meds.forEach(med => {
      if (med.totalQuantity <= 5) {
        alerts.push({
          title: 'Low Inventory',
          message: `${med.name} is running low (${med.totalQuantity} remaining).`
        });
      }
    });

    setNotifications(alerts);
    setHasViewedNotifs(StorageService.getHasViewedNotifs());
  }, []);

  const loadMedicines = useCallback(() => {
    const meds = StorageService.getMedicines();
    setMedicines(meds);
    setSettings(StorageService.getSettings());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
      loadNotifications();
    }, [loadMedicines, loadNotifications])
  );

  let processedMedicines = [...medicines].filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedCategory !== 'All') {
    processedMedicines = processedMedicines.filter(m => m.type === selectedCategory);
  }

  if (sortOrder === 'A-Z') {
    processedMedicines.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === 'Z-A') {
    processedMedicines.sort((a, b) => b.name.localeCompare(a.name));
  }

  const handleOptions = (item) => {
    setSelectedMedicine(item);
    setOptionsModalVisible(true);
  };

  const handleDelete = () => {
    setOptionsModalVisible(false);
    // Add small delay to prevent modal stacking issues
    setTimeout(() => {
      setDeleteModalVisible(true);
    }, 300);
  };

  const handleEdit = () => {
    setOptionsModalVisible(false);
    navigation.navigate('EditMedicine', { medicine: selectedMedicine });
  };

  const confirmDelete = async () => {
    if (!selectedMedicine) return;
    StorageService.deleteMedicine(selectedMedicine.id);
    await NotificationService.cancelAlarms(selectedMedicine.id);
    setSelectedMedicine(null);
    setDeleteModalVisible(false);
    loadMedicines();
  };

  const getFrequencyLabel = (item) => {
    if (item.frequency === 'As Needed') return 'As Needed';
    if (!item.reminders || item.reminders.length === 0) return item.frequency;
    
    const typeLabel = item.type || 'Dose';

    if (item.reminders.length === 1) {
      const d = new Date(item.reminders[0]);
      const h = d.getHours();
      let timeOfDay = 'Nightly';
      if (h >= 5 && h < 12) timeOfDay = 'Morning';
      else if (h >= 12 && h < 17) timeOfDay = 'Noon';
      else if (h >= 17 && h < 20) timeOfDay = 'Evening';

      return `1 ${typeLabel} ${timeOfDay}`;
    } else {
      return `${item.reminders.length} ${typeLabel}s Daily`;
    }
  };

  const renderMedicineCard = ({ item }) => {
    // Basic logic for stock indicators
    const isLowStock = settings.refillReminders && item.totalQuantity <= 5;
    
    return (
      <View style={isLowStock ? styles.cardHighlight : styles.cardNormal}>
        <View style={styles.cardHeader}>
          <View style={isLowStock ? styles.iconWrapperLightRed : styles.iconWrapperLightBlue}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={{ width: 44, height: 44, borderRadius: 10 }} />
            ) : item.type === 'Liquid' ? (
              <LiquidSvg width={24} height={24} color={isLowStock ? "#BA1A1A" : "#0285FF"} />
            ) : item.type === 'Injection' ? (
              <InjectionSvg width={24} height={24} color={isLowStock ? "#BA1A1A" : "#0285FF"} />
            ) : (
              <PillSvg width={24} height={24} color={isLowStock ? "#BA1A1A" : "#0285FF"} />
            )}
          </View>
          <View style={styles.cardTextContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.medTitle}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleOptions(item)}>
                <MaterialIcon name="more-vert" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>
            <Text style={styles.medSub}>{item.strength}{item.unit} • {getFrequencyLabel(item)}</Text>
            
            {item.frequency !== 'As Needed' ? (
              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min((item.totalQuantity / 30) * 100, 100)}%`, backgroundColor: isLowStock ? '#BA1A1A' : '#006F66' }]} />
                </View>
                <Text style={isLowStock ? styles.progressTextRed : styles.progressText}>
                  {item.totalQuantity} {item.unit} left
                </Text>
              </View>
            ) : (
              <View style={styles.badgeGrey}>
                <Text style={styles.badgeGreyText}>Stock ({item.totalQuantity})</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>MedTrack</Text>
        <TouchableOpacity onPress={() => {
          setShowNotifModal(true);
          setHasViewedNotifs(true);
          StorageService.setHasViewedNotifs(true);
        }}>
          <View>
            <Icon name="bell" size={24} color="#0285FF" />
            {notifications.length > 0 && !hasViewedNotifs && (
              <View style={styles.notifBadge} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20 }}>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search cabinet..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>


        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterBtn, selectedCategory !== 'All' && styles.filterBtnActive]} 
            onPress={() => setCategoryModalVisible(true)}
          >
            <MaterialIcon name="filter-list" size={18} color={selectedCategory !== 'All' ? '#0285FF' : '#4B5563'} />
            <Text style={[styles.filterBtnText, selectedCategory !== 'All' && {color: '#0285FF'}]}>
              {selectedCategory === 'All' ? 'Category' : selectedCategory}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, sortOrder !== 'Default' && styles.filterBtnActive]} 
            onPress={() => setSortModalVisible(true)}
          >
            <MaterialIcon name="sort" size={18} color={sortOrder !== 'Default' ? '#0285FF' : '#4B5563'} />
            <Text style={[styles.filterBtnText, sortOrder !== 'Default' && {color: '#0285FF'}]}>
              {sortOrder === 'Default' ? 'Sort' : sortOrder}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={processedMedicines}
          keyExtractor={(item) => item.id}
          renderItem={renderMedicineCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No medications found.</Text>
            </View>
          )}
        />
      </View>


      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddMedicine')}>
        <Icon name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      <CustomModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        title="Medicine Options"
        message={`What would you like to do with ${selectedMedicine?.name}?`}
        options={[
          { text: 'Edit Inventory & Time', onPress: handleEdit },
          { text: 'Delete Medicine', onPress: handleDelete, style: 'destructive' },
          { text: 'Cancel', style: 'cancel' }
        ]}
      />

      <CustomModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Delete Medicine"
        message={`Are you sure you want to delete ${selectedMedicine?.name}? This action cannot be undone.`}
        options={[
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
          { text: 'Cancel', style: 'cancel' }
        ]}
      />

      <CustomModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        title="Filter by Category"
        options={[
          { text: 'All Categories', onPress: () => setSelectedCategory('All') },
          { text: 'Pill', onPress: () => setSelectedCategory('Pill') },
          { text: 'Liquid', onPress: () => setSelectedCategory('Liquid') },
          { text: 'Injection', onPress: () => setSelectedCategory('Injection') },
          { text: 'Cancel', style: 'cancel' }
        ]}
      />

      <CustomModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        title="Sort Options"
        options={[
          { text: 'Default (Date Added)', onPress: () => setSortOrder('Default') },
          { text: 'Name (A to Z)', onPress: () => setSortOrder('A-Z') },
          { text: 'Name (Z to A)', onPress: () => setSortOrder('Z-A') },
          { text: 'Cancel', style: 'cancel' }
        ]}
      />

      <CustomModal
        visible={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        title="Notifications"
        message={notifications.length === 0 ? "You're all caught up! No missed doses or low stock." : notifications.map(n => `• ${n.title}: ${n.message}`).join('\n\n')}
        options={[{ text: 'Close', style: 'cancel' }]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  brandTitle: { fontSize: 22, fontWeight: 'bold', color: '#0285FF' },
  notifBadge: { position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#BA1A1A', borderWidth: 2, borderColor: '#F8F9FA' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 15, height: 48, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 15 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  filterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 10, marginHorizontal: 5 },
  filterBtnActive: { borderColor: '#0285FF', backgroundColor: '#EAF4FF' },
  filterBtnText: { marginLeft: 8, fontSize: 13, fontWeight: '600', color: '#4B5563' },
  cardNormal: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHighlight: { backgroundColor: '#FFFDFD', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#FCE8E8', shadowColor: '#BA1A1A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: 'row' },
  iconWrapperLightBlue: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconWrapperLightRed: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#FCE8E8', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTextContent: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  medSub: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressBarBg: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginRight: 12 },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 11, color: '#4B5563' },
  progressTextRed: { fontSize: 11, color: '#BA1A1A', fontWeight: '500' },
  textBtn: { marginTop: 12, alignSelf: 'flex-start' },
  textBtnText: { color: '#0285FF', fontSize: 13, fontWeight: '600' },
  badgeGrey: { backgroundColor: '#E5E7EB', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 4 },
  badgeGreyText: { fontSize: 10, color: '#4B5563', fontWeight: '600' },
  fab: { position: 'absolute', bottom: 20, alignSelf: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: '#0285FF', justifyContent: 'center', alignItems: 'center', shadowColor: '#0285FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#9CA3AF', fontSize: 15 }
});

export default CabinetScreen;
