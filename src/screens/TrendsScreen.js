import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StorageService } from '../services/StorageService';
import NotificationService from '../services/NotificationService';
import CustomModal from '../components/CustomModal';
import Icon from 'react-native-vector-icons/Feather';
import Svg, { Circle } from 'react-native-svg';

import PillBottleSvg from '../assets/trends/Container.svg';
import TrendUpSvg from '../assets/trends/Container (1).svg';
import FlameSvg from '../assets/trends/Container (2).svg';
import AlertTriangleSvg from '../assets/trends/Container (3).svg';

const CircularProgress = ({ percent, color, trackColor = '#E5E7EB' }) => {
  const radius = 20;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={styles.circularProgressContainer}>
      <Svg width="48" height="48" viewBox="0 0 48 48">
        <Circle cx="24" cy="24" r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx="24"
          cy="24"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin="24, 24"
        />
      </Svg>
      <Text style={styles.circularProgressText}>{percent}</Text>
    </View>
  );
};

const TrendsScreen = () => {
  const [viewMode, setViewMode] = useState('Weekly');
  const [analytics, setAnalytics] = useState({
    adherencePercent: 0,
    bestStreak: 0,
    missedMostOften: 'None',
    missedMostOftenSub: '',
    breakdown: [],
    trendPercent: 0,
    daysStatus: []
  });

  const [notifications, setNotifications] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [hasViewedNotifs, setHasViewedNotifs] = useState(false);

  const loadNotifications = useCallback(() => {
    const alerts = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const daily = StorageService.getDailySchedules(todayStr);
    daily.forEach(item => {
      if (item.status === 'Missed') {
        alerts.push({ title: 'Missed Dose', message: `You missed ${item.name} at ${item.expectedTime}.` });
      }
    });
    const meds = StorageService.getMedicines();
    meds.forEach(med => {
      if (med.totalQuantity <= 5) {
        alerts.push({ title: 'Low Inventory', message: `${med.name} is running low (${med.totalQuantity} remaining).` });
      }
    });
    setNotifications(alerts);
    setHasViewedNotifs(StorageService.getHasViewedNotifs());
  }, []);

  const calculateAnalytics = useCallback(() => {
    const logsObj = StorageService.getLogs();
    const medicines = StorageService.getMedicines();
    
    const now = new Date();
    // Normalize now to midnight for day calculations
    const todayStr = now.toISOString().split('T')[0];
    const todayDate = new Date(todayStr);

    // 1. Streak Calculation (All Time)
    let currentStreak = 0;
    let bestStreak = 0;
    const sortedDates = Object.keys(logsObj).sort();
    if (sortedDates.length > 0) {
      const firstDate = new Date(sortedDates[0]);
      const daysDiff = Math.ceil((todayDate - firstDate) / (1000 * 60 * 60 * 24));
      const evaluateDays = Math.min(daysDiff + 1, 365); // Cap at 1 year for performance
      
      for (let i = evaluateDays - 1; i >= 0; i--) {
        const d = new Date(todayDate);
        d.setDate(todayDate.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        
        const schedules = StorageService.getDailySchedules(dStr);
        let sTotal = 0;
        let sMissed = 0;
        let sTaken = 0;
        schedules.forEach(s => {
          if (s.expectedTime && (s.status === 'Taken' || s.status === 'Missed')) {
            sTotal++;
            if (s.status === 'Missed') sMissed++;
            else if (s.status === 'Taken') sTaken++;
          }
        });
        
        if (sTotal > 0) {
          if (sMissed === 0 && sTaken === sTotal) {
            currentStreak++;
            if (currentStreak > bestStreak) bestStreak = currentStreak;
          } else {
            currentStreak = 0;
          }
        }
      }
    }

    // 2. Current & Previous Period Adherence
    const periodLength = viewMode === 'Weekly' ? 7 : 30;
    let currentTotalDoses = 0;
    let currentTakenDoses = 0;
    let prevTotalDoses = 0;
    let prevTakenDoses = 0;

    const medMissCounts = {};
    const medMissTimes = {};
    const breakdownMap = {};

    medicines.forEach(m => {
      breakdownMap[m.id] = { name: m.name, taken: 0, total: 0 };
      medMissCounts[m.id] = 0;
      medMissTimes[m.id] = { morning: 0, afternoon: 0, evening: 0 };
    });

    const daysOfWeekList = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const daysStatus = [];
    const daysToEvaluate = Math.max(periodLength * 2, 7);

    for (let i = daysToEvaluate - 1; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      
      const isCurrentPeriod = i < periodLength;
      const isPrevPeriod = i >= periodLength && i < periodLength * 2;
      const isLast7Days = i < 7;
      
      const schedules = StorageService.getDailySchedules(dStr);
      
      let visualDayTotal = 0;
      let visualDayMissed = 0;
      let visualDayTaken = 0;

      schedules.forEach(s => {
        if (s.expectedTime) {
          // For visual row
          visualDayTotal++;
          if (s.status === 'Missed') visualDayMissed++;
          else if (s.status === 'Taken') visualDayTaken++;

          // For analytics (only past/resolved doses)
          if (s.status === 'Taken' || s.status === 'Missed') {
            if (isCurrentPeriod) {
              currentTotalDoses++;
              breakdownMap[s.id].total++;
              if (s.status === 'Taken') {
                currentTakenDoses++;
                breakdownMap[s.id].taken++;
              } else if (s.status === 'Missed') {
                medMissCounts[s.id]++;
                const [h] = s.expectedTime.split(':').map(Number);
                if (h < 12) medMissTimes[s.id].morning++;
                else if (h < 17) medMissTimes[s.id].afternoon++;
                else medMissTimes[s.id].evening++;
              }
            } else if (isPrevPeriod) {
              prevTotalDoses++;
              if (s.status === 'Taken') prevTakenDoses++;
            }
          }
        }
      });

      if (isLast7Days) {
        let visualStatus = 'none';
        if (visualDayTotal > 0) {
          if (visualDayMissed > 0) {
            visualStatus = 'missed';
          } else if (visualDayTaken === visualDayTotal) {
            visualStatus = 'perfect';
          } else {
            visualStatus = 'partial';
          }
        }
        daysStatus.push({
          label: daysOfWeekList[d.getDay()],
          status: visualStatus,
          isToday: i === 0
        });
      }
    }

    const adherencePercent = currentTotalDoses > 0 ? Math.round((currentTakenDoses / currentTotalDoses) * 100) : 0;
    const prevAdherencePercent = prevTotalDoses > 0 ? Math.round((prevTakenDoses / prevTotalDoses) * 100) : 0;
    let trendPercent = adherencePercent - prevAdherencePercent;

    let missedMostOften = 'None';
    let missedMostOftenSub = '';
    let maxMisses = 0;
    let missedMostId = null;
    
    Object.keys(medMissCounts).forEach(medId => {
      if (medMissCounts[medId] > maxMisses) {
        maxMisses = medMissCounts[medId];
        missedMostOften = breakdownMap[medId].name;
        missedMostId = medId;
      }
    });

    if (missedMostId) {
      const times = medMissTimes[missedMostId];
      if (times.morning >= times.afternoon && times.morning >= times.evening) {
        missedMostOftenSub = 'Usually morning dose';
      } else if (times.afternoon >= times.morning && times.afternoon >= times.evening) {
        missedMostOftenSub = 'Usually afternoon dose';
      } else {
        missedMostOftenSub = 'Usually evening dose';
      }
    }

    const breakdown = Object.values(breakdownMap).filter(b => b.total > 0).map(b => ({
      name: b.name,
      percent: Math.round((b.taken / b.total) * 100)
    }));

    setAnalytics({ adherencePercent, bestStreak, missedMostOften, missedMostOftenSub, breakdown, trendPercent, daysStatus });
  }, [viewMode]);

  useFocusEffect(
    useCallback(() => {
      calculateAnalytics();
      loadNotifications();
    }, [calculateAnalytics, loadNotifications])
  );

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
        
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Your Progress</Text>
          <Text style={styles.pageSubtitle}>
            Consistent tracking builds healthy habits. Here is your adherence overview.
          </Text>
        </View>

        <View style={styles.toggleWrapper}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'Weekly' && styles.toggleBtnActive]}
              onPress={() => setViewMode('Weekly')}
            >
              <Text style={[styles.toggleText, viewMode === 'Weekly' && styles.toggleTextActive]}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'Monthly' && styles.toggleBtnActive]}
              onPress={() => setViewMode('Monthly')}
            >
              <Text style={[styles.toggleText, viewMode === 'Monthly' && styles.toggleTextActive]}>Monthly</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.overallAdherenceCard}>
          <View style={styles.overallHeader}>
            <View>
              <Text style={styles.overallTitle}>Overall Adherence</Text>
              <Text style={styles.overallSubTitle}>This {viewMode === 'Weekly' ? 'Week' : 'Month'}</Text>
            </View>
            <View style={[styles.trendPill, analytics.trendPercent < 0 && styles.trendPillRed]}>
              <TrendUpSvg 
                width={12} 
                height={12} 
                style={{ 
                  marginRight: 4, 
                  transform: [{ rotate: analytics.trendPercent < 0 ? '90deg' : '0deg' }] 
                }} 
              />
              <Text style={[styles.trendPillText, analytics.trendPercent < 0 && styles.trendPillTextRed]}>
                {analytics.trendPercent > 0 ? '+' : ''}{analytics.trendPercent}%
              </Text>
            </View>
          </View>

          <View style={styles.daysRow}>
            {analytics.daysStatus.map((day, idx) => (
              <Text key={idx} style={[
                styles.dayText, 
                day.status === 'perfect' && styles.dayTextPerfect,
                day.status === 'missed' && styles.dayTextMissed,
                day.isToday && styles.dayTextToday
              ]}>
                {day.label}
              </Text>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.adherenceFooter}>
            <Text style={styles.adherencePercentage}>{analytics.adherencePercent}%</Text>
            <Text style={styles.adherenceOnTime}>On Time</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeaderRow}>
              <View style={styles.statIconWrapperGreen}>
                <FlameSvg width={20} height={20} />
              </View>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{analytics.bestStreak} Days</Text>
              <Text style={styles.statSubGreen}>Keep it up!</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeaderRow}>
              <View style={styles.statIconWrapperRed}>
                <AlertTriangleSvg width={20} height={20} />
              </View>
              <Text style={styles.statLabel}>Missed Most Often</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { fontSize: 16 }]} numberOfLines={1}>{analytics.missedMostOften}</Text>
              {analytics.missedMostOften !== 'None' && (
                <Text style={styles.statSubRed}>{analytics.missedMostOftenSub}</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Medication Breakdown</Text>
        
        {analytics.breakdown.length === 0 ? (
          <Text style={styles.emptyText}>No data available for this period.</Text>
        ) : (
          <View style={styles.breakdownContainer}>
            {analytics.breakdown.map((item, index) => (
              <View key={index} style={styles.breakdownCard}>
                <View style={styles.breakdownLeft}>
                  <View style={styles.breakdownIconWrapper}>
                    <PillBottleSvg width={24} height={24} />
                  </View>
                  <View style={styles.breakdownTextWrap}>
                    <Text style={styles.breakdownMedName}>{item.name}</Text>
                    <Text style={styles.breakdownPercentText}>{item.percent}% Adherence</Text>
                  </View>
                </View>
                <CircularProgress 
                  percent={item.percent} 
                  color={item.percent >= 80 ? '#0285FF' : '#BA1A1A'} 
                />
              </View>
            ))}
          </View>
        )}

      </ScrollView>
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
  
  titleSection: { marginHorizontal: 20, marginBottom: 20 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: '#4B5563', lineHeight: 20 },

  toggleWrapper: { paddingHorizontal: 20, marginBottom: 20 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#E3EBF9', borderWidth: 1, borderColor: '#0285FF' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  toggleTextActive: { color: '#0285FF' },

  scrollContent: { paddingBottom: 40 },

  overallAdherenceCard: { marginHorizontal: 20, backgroundColor: '#F4F7FF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#0285FF' },
  overallHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  overallTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  overallSubTitle: { fontSize: 13, color: '#6B7280' },
  
  trendPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#A7F3D0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  trendPillRed: { backgroundColor: '#FEE2E2' },
  trendPillText: { fontSize: 12, fontWeight: '700', color: '#006F66' },
  trendPillTextRed: { color: '#BA1A1A' },
  
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 15 },
  dayText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  dayTextPerfect: { color: '#006F66' },
  dayTextMissed: { color: '#BA1A1A' },
  dayTextToday: { textDecorationLine: 'underline' },
  
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 15 },
  adherenceFooter: { flexDirection: 'row', alignItems: 'baseline' },
  adherencePercentage: { fontSize: 32, fontWeight: '800', color: '#0285FF', marginRight: 8 },
  adherenceOnTime: { fontSize: 14, color: '#4B5563' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  statHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statIconWrapperGreen: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#CCFBF1', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  statIconWrapperRed: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  statLabel: { fontSize: 13, fontWeight: '700', color: '#111827', flex: 1 },
  statContent: { marginTop: 'auto' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  statSubGreen: { fontSize: 12, fontWeight: '600', color: '#006F66' },
  statSubRed: { fontSize: 12, fontWeight: '500', color: '#BA1A1A' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginHorizontal: 20, marginBottom: 15 },
  
  breakdownContainer: { marginHorizontal: 20 },
  breakdownCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  breakdownIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  breakdownTextWrap: { flex: 1, paddingRight: 10 },
  breakdownMedName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  breakdownPercentText: { fontSize: 13, color: '#6B7280' },
  
  circularProgressContainer: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  circularProgressText: { position: 'absolute', fontSize: 12, fontWeight: '700', color: '#111827' },
  
  emptyText: { color: '#9CA3AF', fontSize: 15, textAlign: 'center', marginTop: 20 }
});

export default TrendsScreen;
