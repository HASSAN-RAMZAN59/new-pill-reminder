import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { StorageService } from '../services/StorageService';

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

  const selectedDateString = selectedDateObj.toISOString().split('T')[0];

  const loadSchedules = useCallback(() => {
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
    }, [loadSchedules])
  );

  const datesList = getDatesAround(new Date(), 3);

  const handleLogAction = (item, action) => {
    StorageService.logDose(item.id, item.expectedTime, selectedDateString, action);
    
    if (action === 'Taken') {
      const meds = StorageService.getMedicines();
      const med = meds.find(m => m.id === item.id);
      if (med) {
        StorageService.updateMedicine(item.id, { totalQuantity: Math.max(0, med.totalQuantity - 1) });
      }
    }
    
    loadSchedules();
  };

  const renderCard = (item) => {
    const isTaken = item.status === 'Taken';
    const isMissed = item.status === 'Missed';
    const isUpcoming = item.status === 'Upcoming' || item.status === 'Snoozed';

    return (
      <View key={`${item.id}-${item.expectedTime}`} style={isMissed ? styles.cardWarning : (isUpcoming ? styles.cardActive : styles.cardNormal)}>
        <View style={styles.cardHeader}>
          <View style={isMissed ? styles.iconWrapperSolidRed : (isTaken ? styles.iconWrapperBlue : styles.iconWrapperSolidBlue)}>
            <Icon name={item.type === 'Liquid' ? 'droplet' : (item.type === 'Injection' ? 'activity' : 'plus-square')} size={20} color={isTaken ? "#0285FF" : "#FFF"} />
          </View>
          <View style={styles.cardTextContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.medTitle}>{item.name}</Text>
              {isTaken && <View style={styles.tagTaken}><Text style={styles.tagTakenText}>Taken</Text></View>}
              {isUpcoming && <View style={styles.tagUpcoming}><Text style={styles.tagUpcomingText}>{item.status}</Text></View>}
              {isMissed && <Text style={styles.textMissed}>Missed</Text>}
            </View>
            <Text style={styles.medSub}>{item.strength}{item.unit} • {item.expectedTime || 'PRN'}</Text>
          </View>
          {isTaken && <MaterialIcon name="check-circle" size={24} color="#059669" />}
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
        <TouchableOpacity>
          <Icon name="bell" size={24} color="#0285FF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Date Info Section */}
        <View style={styles.dateHeader}>
          <View>
            <Text style={styles.todayTitle}>
              {selectedDateString === new Date().toISOString().split('T')[0] ? 'Today' : selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' })}
            </Text>
            <Text style={styles.todayDate}>{selectedDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.badgeTaken}>
            <MaterialIcon name="check-circle" size={12} color="#059669" />
            <Text style={styles.badgeTakenText}> {adherence.taken}/{adherence.total} Taken</Text>
          </View>
        </View>

        {/* Date Selector */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  brandTitle: { fontSize: 22, fontWeight: 'bold', color: '#0285FF' },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  todayTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  todayDate: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  badgeTaken: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeTakenText: { color: '#059669', fontSize: 12, fontWeight: '600' },
  dateSelector: { flexDirection: 'row', marginBottom: 30 },
  dateBox: { width: 60, height: 70, backgroundColor: '#FFFFFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  dateBoxActive: { backgroundColor: '#0285FF' },
  dateDay: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  dateNum: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  dateTextActive: { color: '#FFFFFF' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFFFFF', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 15, marginTop: 10 },
  cardNormal: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardActive: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1.5, borderColor: '#0285FF', shadowColor: '#0285FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  cardWarning: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#FECACA' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconWrapperBlue: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBF5FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconWrapperSolidBlue: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0285FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconWrapperSolidRed: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTextContent: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 },
  medTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  medSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  tagTaken: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagTakenText: { color: '#059669', fontSize: 10, fontWeight: '600' },
  tagUpcoming: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagUpcomingText: { color: '#4B5563', fontSize: 10, fontWeight: '600' },
  textMissed: { color: '#DC2626', fontSize: 10, fontWeight: '600', textAlign: 'right' },
  cardActions: { flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' },
  btnSecondary: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', marginRight: 10 },
  btnSecondaryText: { color: '#4B5563', fontSize: 14, fontWeight: '600' },
  btnPrimary: { flex: 1, backgroundColor: '#0285FF', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnPrimaryFull: { width: '100%', backgroundColor: '#0285FF', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' }
});

export default HomeScreen;
