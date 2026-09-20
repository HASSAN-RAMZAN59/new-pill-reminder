import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const CabinetScreen = () => {
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
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search cabinet..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn}>
            <MaterialIcon name="filter-list" size={18} color="#4B5563" />
            <Text style={styles.filterBtnText}>Category</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <MaterialIcon name="sort" size={18} color="#4B5563" />
            <Text style={styles.filterBtnText}>A-Z</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Maintenance */}
        <Text style={styles.sectionTitle}>Daily Maintenance</Text>

        <View style={styles.cardNormal}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapperLightBlue}>
              <Icon name="link-2" size={20} color="#0285FF" />
            </View>
            <View style={styles.cardTextContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.medTitle}>Lisinopril</Text>
                <TouchableOpacity><MaterialIcon name="more-vert" size={20} color="#4B5563" /></TouchableOpacity>
              </View>
              <Text style={styles.medSub}>10mg • 1 pill daily</Text>
              
              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '70%', backgroundColor: '#059669' }]} />
                </View>
                <Text style={styles.progressText}>22 days left</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardHighlight}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapperLightRed}>
              <Text style={{color: '#DC2626', fontWeight: 'bold', fontSize: 10}}>HIVE</Text>
            </View>
            <View style={styles.cardTextContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.medTitle}>Atorvastatin</Text>
                <TouchableOpacity><MaterialIcon name="more-vert" size={20} color="#4B5563" /></TouchableOpacity>
              </View>
              <Text style={styles.medSub}>20mg • 1 capsule nightly</Text>
              
              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '15%', backgroundColor: '#DC2626' }]} />
                </View>
                <Text style={styles.progressTextRed}>4 days left</Text>
              </View>

              <TouchableOpacity style={styles.textBtn}>
                <Text style={styles.textBtnText}>Request Refill</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* As Needed (PRN) */}
        <Text style={styles.sectionTitle}>As Needed (PRN)</Text>

        <View style={styles.cardNormal}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapperGrey}>
              <Icon name="plus-square" size={20} color="#6B7280" />
            </View>
            <View style={styles.cardTextContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.medTitle}>Ibuprofen</Text>
                <TouchableOpacity><MaterialIcon name="more-vert" size={20} color="#4B5563" /></TouchableOpacity>
              </View>
              <Text style={styles.medSub}>400mg • Every 6 hrs</Text>
              
              <View style={styles.badgeGrey}>
                <Text style={styles.badgeGreyText}>High Stock ({'>'}50)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{height: 80}} />

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

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
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0285FF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
  },
  filterBtnText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
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
  cardHighlight: {
    backgroundColor: '#FFFDFD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
  },
  iconWrapperLightBlue: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconWrapperLightRed: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconWrapperGrey: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 12,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#4B5563',
  },
  progressTextRed: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '500',
  },
  textBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  textBtnText: {
    color: '#0285FF',
    fontSize: 13,
    fontWeight: '600',
  },
  badgeGrey: {
    backgroundColor: '#E5E7EB',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  badgeGreyText: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0285FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0285FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default CabinetScreen;
