import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StorageService } from '../services/StorageService';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const TrendsScreen = () => {
  const [viewMode, setViewMode] = useState('Weekly');
  const [analytics, setAnalytics] = useState({
    adherencePercent: 0,
    bestStreak: 0,
    missedMostOften: 'None',
    breakdown: []
  });

  const calculateAnalytics = useCallback(() => {
    const logsObj = StorageService.getLogs();
    const medicines = StorageService.getMedicines();
    
    // Determine cutoff date based on view mode
    const now = new Date();
    const cutoffDate = new Date();
    if (viewMode === 'Weekly') {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setMonth(now.getMonth() - 1);
    }

    let totalDoses = 0;
    let takenDoses = 0;
    
    // For streak calculation
    let currentStreak = 0;
    let bestStreak = 0;
    const sortedDates = Object.keys(logsObj).sort(); // Sort chronological

    const medMissCounts = {};
    const breakdownMap = {}; // { medId: { taken: 0, total: 0, name: '' } }

    medicines.forEach(m => {
      breakdownMap[m.id] = { name: m.name, taken: 0, total: 0 };
      medMissCounts[m.id] = 0;
    });

    sortedDates.forEach(dateStr => {
      const logDate = new Date(dateStr);
      if (logDate >= cutoffDate) {
        let dayPerfect = true;
        let dayHasLogs = false;

        logsObj[dateStr].forEach(log => {
          dayHasLogs = true;
          totalDoses++;
          
          if (breakdownMap[log.medicineId]) {
            breakdownMap[log.medicineId].total++;
          }

          if (log.status === 'Taken') {
            takenDoses++;
            if (breakdownMap[log.medicineId]) breakdownMap[log.medicineId].taken++;
          } else if (log.status === 'Missed') {
            dayPerfect = false;
            if (medMissCounts[log.medicineId] !== undefined) {
              medMissCounts[log.medicineId]++;
            }
          } else {
             // Snoozed or other state that is not taken
             dayPerfect = false;
          }
        });

        if (dayHasLogs && dayPerfect) {
          currentStreak++;
          if (currentStreak > bestStreak) bestStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      }
    });

    const adherencePercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

    let missedMostOften = 'None';
    let maxMisses = 0;
    Object.keys(medMissCounts).forEach(medId => {
      if (medMissCounts[medId] > maxMisses) {
        maxMisses = medMissCounts[medId];
        missedMostOften = breakdownMap[medId].name;
      }
    });

    const breakdown = Object.values(breakdownMap).filter(b => b.total > 0).map(b => ({
      name: b.name,
      percent: Math.round((b.taken / b.total) * 100)
    }));

    setAnalytics({
      adherencePercent,
      bestStreak,
      missedMostOften,
      breakdown
    });
  }, [viewMode]);

  useFocusEffect(
    useCallback(() => {
      calculateAnalytics();
    }, [calculateAnalytics])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Trends</Text>
      </View>

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Metric */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Overall Adherence</Text>
          <Text style={styles.heroValue}>{analytics.adherencePercent}%</Text>
          <Text style={styles.heroSub}>{viewMode} average</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapperGreen}>
              <MaterialIcon name="local-fire-department" size={20} color="#059669" />
            </View>
            <Text style={styles.statValue}>{analytics.bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak (Days)</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconWrapperRed}>
              <MaterialIcon name="warning" size={20} color="#DC2626" />
            </View>
            <Text style={[styles.statValue, { fontSize: 18 }]} numberOfLines={1}>{analytics.missedMostOften}</Text>
            <Text style={styles.statLabel}>Missed Most</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Medication Breakdown</Text>
        
        {analytics.breakdown.length === 0 ? (
          <Text style={styles.emptyText}>No data available for this period.</Text>
        ) : (
          <View style={styles.breakdownCard}>
            {analytics.breakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownTextRow}>
                  <Text style={styles.breakdownMedName}>{item.name}</Text>
                  <Text style={styles.breakdownPercent}>{item.percent}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.percent}%`, backgroundColor: item.percent < 50 ? '#DC2626' : (item.percent < 80 ? '#F59E0B' : '#059669') }]} />
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  brandTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  toggleContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#E5E7EB', borderRadius: 8, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  toggleTextActive: { color: '#111827' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  heroCard: { backgroundColor: '#0285FF', borderRadius: 20, padding: 25, alignItems: 'center', marginBottom: 15, shadowColor: '#0285FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  heroLabel: { color: '#E0F2FE', fontSize: 15, fontWeight: '600', marginBottom: 5 },
  heroValue: { color: '#FFFFFF', fontSize: 48, fontWeight: 'bold' },
  heroSub: { color: '#BAE6FD', fontSize: 13, marginTop: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, alignItems: 'center' },
  statIconWrapperGreen: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statIconWrapperRed: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 15 },
  breakdownCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  breakdownItem: { marginBottom: 15 },
  breakdownTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  breakdownMedName: { fontSize: 15, fontWeight: '600', color: '#374151' },
  breakdownPercent: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  progressBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 },
  progressBarFill: { height: 8, borderRadius: 4 },
  emptyText: { color: '#9CA3AF', fontSize: 15, textAlign: 'center', marginTop: 20 }
});

export default TrendsScreen;
