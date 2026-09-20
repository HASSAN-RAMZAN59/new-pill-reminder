import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const DUMMY_DATES = [
  { day: 'Mon', date: '9' },
  { day: 'Tue', date: '10' },
  { day: 'Wed', date: '11' },
  { day: 'Thu', date: '12', active: true },
  { day: 'Fri', date: '13' },
  { day: 'Sat', date: '14' },
];

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
            <Text style={styles.todayTitle}>Today</Text>
            <Text style={styles.todayDate}>October 12th</Text>
          </View>
          <View style={styles.badgeTaken}>
            <MaterialIcon name="check-circle" size={12} color="#059669" />
            <Text style={styles.badgeTakenText}> 2/5 Taken</Text>
          </View>
        </View>

        {/* Date Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
          {DUMMY_DATES.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.dateBox, item.active && styles.dateBoxActive]}
            >
              <Text style={[styles.dateDay, item.active && styles.dateTextActive]}>{item.day}</Text>
              <Text style={[styles.dateNum, item.active && styles.dateTextActive]}>{item.date}</Text>
              {item.active && <View style={styles.activeDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Morning Section */}
        <Text style={styles.sectionTitle}>Morning</Text>
        
        <View style={styles.cardNormal}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapperBlue}>
              <Icon name="plus-square" size={20} color="#0285FF" />
            </View>
            <View style={styles.cardTextContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.medTitle}>Lisinopril</Text>
                <View style={styles.tagTaken}><Text style={styles.tagTakenText}>Taken</Text></View>
              </View>
              <Text style={styles.medSub}>10mg • 8:00 AM</Text>
            </View>
            <MaterialIcon name="check-circle" size={24} color="#059669" />
          </View>
        </View>

        <View style={styles.cardNormal}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapperBlue}>
              <Icon name="disc" size={20} color="#0285FF" />
            </View>
            <View style={styles.cardTextContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.medTitle}>Vitamin D3</Text>
                <View style={styles.tagTaken}><Text style={styles.tagTakenText}>Taken</Text></View>
              </View>
              <Text style={styles.medSub}>2000 IU • 8:00 AM</Text>
            </View>
            <MaterialIcon name="check-circle" size={24} color="#059669" />
          </View>
        </View>

        {/* Afternoon Section */}
        <Text style={styles.sectionTitle}>Afternoon</Text>

        <View style={styles.cardActive}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapperSolidBlue}>
              <Icon name="file-text" size={20} color="#FFF" />
            </View>
            <View style={styles.cardTextContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.medTitle}>Metformin</Text>
                <View style={styles.tagUpcoming}><Text style={styles.tagUpcomingText}>Upcoming</Text></View>
              </View>
              <Text style={styles.medSub}>500mg • 1:00 PM</Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.btnSecondary}><Text style={styles.btnSecondaryText}>Snooze</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Take</Text></TouchableOpacity>
          </View>
        </View>

        {/* Evening Section */}
        <Text style={styles.sectionTitle}>Evening</Text>

        <View style={styles.cardWarning}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapperSolidRed}>
              <Icon name="alert-triangle" size={20} color="#DC2626" />
            </View>
            <View style={styles.cardTextContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.medTitle}>Atorvastatin</Text>
                <Text style={styles.textMissed}>Missed{'\n'}Yesterday</Text>
              </View>
              <Text style={styles.medSub}>40mg • 8:00 PM</Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.btnPrimaryFull}><Text style={styles.btnPrimaryText}>Log Now</Text></TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0285FF',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  todayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  todayDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeTaken: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeTakenText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dateBox: {
    width: 60,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dateBoxActive: {
    backgroundColor: '#0285FF',
  },
  dateDay: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  cardNormal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardActive: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#0285FF',
    shadowColor: '#0285FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardWarning: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapperBlue: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconWrapperSolidBlue: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0285FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconWrapperSolidRed: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  medTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  medSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  tagTaken: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagTakenText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '600',
  },
  tagUpcoming: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagUpcomingText: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '600',
  },
  textMissed: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginRight: 10,
  },
  btnSecondaryText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#0285FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryFull: {
    width: '100%',
    backgroundColor: '#0285FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
