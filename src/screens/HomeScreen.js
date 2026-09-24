import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
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

// Helper to get array of dates around today
const getDatesAround = (centerDate, numDays = 3) => {
  const dates = [];
  for (let i = -numDays; i <= numDays; i++) {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const HomeScreen = () => {
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());
  const [schedules, setSchedules] = useState({ morning: [], afternoon: [], evening: [] });
  const [adherence, setAdherence] = useState({ taken: 0, total: 0 });
  const [settings, setSettings] = useState({ pillImageDisplay: true });
  const [notifications, setNotifications] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [hasViewedNotifs, setHasViewedNotifs] = useState(false);

  const selectedDateString = selectedDateObj.toISOString().split('T')[0];

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

    const medicines = StorageService.getMedicines();
    medicines.forEach(med => {
      if (med.totalQuantity <= 5) {
        alerts.push({
          title: 'Low Inventory',
          message: `${med.name} is running low (Only ${med.totalQuantity} quantity left).`
        });
      }
    });

    setNotifications(alerts);
    setHasViewedNotifs(StorageService.getHasViewedNotifs());
  }, []);

  const loadSchedules = useCallback(() => {
    setSettings(StorageService.getSettings());
    const daily = StorageService.getDailySchedules(selectedDateString);
    
    const morning = [];
    const afternoon = [];
    const evening = [];
    let takenCount = 0;
    
    daily.forEach(item => {
      if (item.status === 'Taken') takenCount++;
      
      if (!item.expectedTime) {
        // As Needed - dump in afternoon or evening randomly? Let's put in afternoon
        afternoon.push(item);
        return;
      }
      
      const [h] = item.expectedTime.split(':').map(Number);
      if (h < 12) morning.push(item);
      else if (h < 17) afternoon.push(item);
      else evening.push(item);
    });

    setSchedules({ morning, afternoon, evening });
    setAdherence({ taken: takenCount, total: daily.length });
  }, [selectedDateString]);

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
      loadNotifications();
    }, [loadSchedules, loadNotifications])
  );

  const datesList = getDatesAround(new Date(), 3);

  const handleLogAction = (item, action) => {
    StorageService.logDose(item.id, item.expectedTime, selectedDateString, action);
    
    if (action === 'Taken') {
      const meds = StorageService.getMedicines();
      const med = meds.find(m => m.id === item.id);
      if (med) {
        const newQty = Math.max(0, med.totalQuantity - 1);
        StorageService.updateMedicine(item.id, { totalQuantity: newQty });
        NotificationService.checkAndTriggerRefillAlarm(med, newQty);
      }
    } else if (action === 'Snoozed') {
      const meds = StorageService.getMedicines();
      const med = meds.find(m => m.id === item.id);
      if (med) {
        NotificationService.scheduleSnooze(med);
      }
    }
    
    loadSchedules();
    NotificationService.scheduleDailySummary();
  };

  const renderCard = (item) => {
    const isTaken = item.status === 'Taken';
    const isMissed = item.status === 'Missed';
    const isUpcoming = item.status === 'Upcoming' || item.status === 'Snoozed';

    return (
      <View key={`${item.id}-${item.expectedTime}`} style={isMissed ? styles.cardWarning : (isUpcoming ? styles.cardActive : styles.cardNormal)}>
        <View style={styles.cardHeader}>
          <View style={isMissed ? styles.iconWrapperSolidRed : (isTaken ? styles.iconWrapperBlue : styles.iconWrapperSolidBlue)}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={{ width: 44, height: 44, borderRadius: 22 }} />
            ) : item.type === 'Liquid' ? (
              <LiquidSvg width={20} height={20} color={isMissed ? "#BA1A1A" : (isTaken ? "#0285FF" : "#FFF")} />
            ) : item.type === 'Injection' ? (
              <InjectionSvg width={20} height={20} color={isMissed ? "#BA1A1A" : (isTaken ? "#0285FF" : "#FFF")} />
            ) : (
              <PillSvg width={20} height={20} color={isMissed ? "#BA1A1A" : (isTaken ? "#0285FF" : "#FFF")} />
            )}
          </View>
          <View style={styles.cardTextContent}>
            <View style={styles.cardTitleRow}>
              <View style={styles.titleWithTag}>
                <View style={styles.titleWrapper}>
                  <Text style={[styles.medTitle, isTaken && styles.medTitleTaken]} numberOfLines={1}>{item.name}</Text>
                  {isTaken && <View style={styles.strikethroughLine} />}
                </View>
                {isTaken && <View style={styles.tagTaken}><Text style={styles.tagTakenText}>Taken</Text></View>}
                {isUpcoming && <View style={styles.tagUpcoming}><Text style={styles.tagUpcomingText}>{item.status}</Text></View>}
              </View>
              {isMissed && <Text style={styles.textMissed}>Missed</Text>}
            </View>
            <Text style={styles.medSub}>{item.strength}{item.unit} • {item.expectedTime || 'PRN'}</Text>
          </View>
          {isTaken && <MaterialIcon name="check-circle" size={24} color="#006F66" />}
        </View>

        {(isUpcoming || isMissed) && (
          <View style={styles.cardActions}>
            {isUpcoming && (
              <>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => handleLogAction(item, 'Snoozed')}>
                  <Text style={styles.btnSecondaryText}>Snooze</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => handleLogAction(item, 'Taken')}>
                  <Text style={styles.btnPrimaryText}>Take</Text>
                </TouchableOpacity>
              </>
            )}
            {isMissed && (
              <TouchableOpacity style={styles.btnPrimaryFull} onPress={() => handleLogAction(item, 'Taken')}>
                <Text style={styles.btnPrimaryText}>Log Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderSection = (title, items) => {
    if (items.length === 0) return null;
    return (
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map(renderCard)}
      </View>
    );
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        

        <View style={styles.dateHeader}>
          <View>
            <Text style={styles.todayTitle}>
              {selectedDateString === new Date().toISOString().split('T')[0] ? 'Today' : selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' })}
            </Text>
            <Text style={styles.todayDate}>{selectedDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.badgeTaken}>
            <MaterialIcon name="check-circle" size={12} color="#006F66" />
            <Text style={styles.badgeTakenText}> {adherence.taken}/{adherence.total} Taken</Text>
          </View>
        </View>


        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
          {datesList.map((d, index) => {
            const isActive = d.toISOString().split('T')[0] === selectedDateString;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.dateBox, isActive && styles.dateBoxActive]}
                onPress={() => setSelectedDateObj(d)}
              >
                <Text style={[styles.dateDay, isActive && styles.dateTextActive]}>{dayNames[d.getDay()]}</Text>
                <Text style={[styles.dateNum, isActive && styles.dateTextActive]}>{d.getDate()}</Text>
                {isActive && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {adherence.total === 0 && (
           <View style={{alignItems: 'center', marginTop: 40}}>
             <Text style={{color: '#9CA3AF'}}>No medications scheduled for this day.</Text>
           </View>
        )}

        {renderSection('Morning', schedules.morning)}
        {renderSection('Afternoon', schedules.afternoon)}
        {renderSection('Evening', schedules.evening)}

      </ScrollView>

      <CustomModal
        visible={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        title="Notifications"
        message={notifications.length > 0 
          ? notifications.map(n => `• ${n.title}:\n  ${n.message}`).join('\n\n')
          : "You are all caught up! No new notifications."}
        options={[{ text: 'Close', onPress: () => setShowNotifModal(false) }]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#BA1A1A',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  brandTitle: { fontSize: 22, fontWeight: 'bold', color: '#0285FF' },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  todayTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  todayDate: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  badgeTaken: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F0EF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeTakenText: { color: '#006F66', fontSize: 12, fontWeight: '600' },
  dateSelector: { flexDirection: 'row', marginBottom: 30 },
  dateBox: { width: 60, height: 70, backgroundColor: '#FFFFFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  dateBoxActive: { backgroundColor: '#0285FF' },
  dateDay: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  dateNum: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  dateTextActive: { color: '#FFFFFF' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFFFFF', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 15, marginTop: 10 },
  cardNormal: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  cardActive: { backgroundColor: '#F0F9FF', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1.5, borderColor: '#0285FF' },
  cardWarning: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#FECACA' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconWrapperBlue: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBF5FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconWrapperSolidBlue: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0285FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconWrapperSolidRed: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FCE8E8', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTextContent: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 },
  titleWithTag: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  titleWrapper: { justifyContent: 'center' },
  medTitle: { fontSize: 17, fontWeight: '700', color: '#111827', flexShrink: 1 },
  medTitleTaken: { color: '#6B7280' },
  strikethroughLine: { position: 'absolute', height: 2, backgroundColor: '#6B7280', width: '100%', top: '50%', marginTop: -1 },
  medSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  tagTaken: { backgroundColor: '#E6F0EF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  tagTakenText: { color: '#006F66', fontSize: 10, fontWeight: '600' },
  tagUpcoming: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  tagUpcomingText: { color: '#4B5563', fontSize: 10, fontWeight: '600' },
  textMissed: { color: '#BA1A1A', fontSize: 10, fontWeight: '600', textAlign: 'right' },
  cardActions: { flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' },
  btnSecondary: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', marginRight: 10 },
  btnSecondaryText: { color: '#4B5563', fontSize: 14, fontWeight: '600' },
  btnPrimary: { flex: 1, backgroundColor: '#0285FF', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  btnPrimaryFull: { width: '100%', backgroundColor: '#0285FF', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' }
});

export default HomeScreen;
