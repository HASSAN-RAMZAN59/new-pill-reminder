import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { StorageService } from '../services/StorageService';
import NotificationService from '../services/NotificationService';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    refillReminders: true,
    snoozeDuration: 15,
    pillImageDisplay: true,
    dailySummary: true,
    doseAlerts: true,
    soundVibration: true,
    biometricLock: false,
  });

  const loadSettings = useCallback(() => {
    setSettings(StorageService.getSettings());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    StorageService.updateSettings({ [key]: value });

    // Handle global side effects
    if (key === 'doseAlerts') {
      await NotificationService.syncAllAlarms();
    }
  };

  const handleSnoozeDurationClick = () => {
    Alert.alert(
      'Snooze Duration',
      'Select default snooze time',
      [
        { text: '5 mins', onPress: () => updateSetting('snoozeDuration', 5) },
        { text: '15 mins', onPress: () => updateSetting('snoozeDuration', 15) },
        { text: '30 mins', onPress: () => updateSetting('snoozeDuration', 30) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderSectionHeader = (title) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderToggleItem = (icon, title, valueKey) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <Icon name={icon} size={20} color="#6B7280" style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Switch
        value={settings[valueKey]}
        onValueChange={(val) => updateSetting(valueKey, val)}
        trackColor={{ false: '#D1D5DB', true: '#0285FF' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const renderChevronItem = (icon, title, valueText, onPress) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <Icon name={icon} size={20} color="#6B7280" style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingItemRight}>
        {valueText ? <Text style={styles.settingValueText}>{valueText}</Text> : null}
        <Icon name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {renderSectionHeader('MEDICATION PREFERENCES')}
        <View style={styles.sectionCard}>
          {renderToggleItem('bell', 'Refill Reminders', 'refillReminders')}
          <View style={styles.divider} />
          {renderChevronItem('clock', 'Snooze Duration', `${settings.snoozeDuration} mins`, handleSnoozeDurationClick)}
          <View style={styles.divider} />
          {renderToggleItem('image', 'Pill Image Display', 'pillImageDisplay')}
        </View>

        {renderSectionHeader('NOTIFICATIONS')}
        <View style={styles.sectionCard}>
          {renderChevronItem('calendar', 'Daily Summary', null, () => {})}
          <View style={styles.divider} />
          {renderToggleItem('alert-circle', 'Dose Alerts', 'doseAlerts')}
          <View style={styles.divider} />
          {renderChevronItem('volume-2', 'Sound & Vibration', null, () => {})}
        </View>

        {renderSectionHeader('SECURITY & PRIVACY')}
        <View style={styles.sectionCard}>
          {renderToggleItem('lock', 'Biometric Lock', 'biometricLock')}
          <View style={styles.divider} />
          {renderChevronItem('download', 'Data Export', null, () => {})}
        </View>

        {renderSectionHeader('SUPPORT & ABOUT')}
        <View style={styles.sectionCard}>
          {renderChevronItem('help-circle', 'Help Center', null, () => {})}
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Icon name="info" size={20} color="#6B7280" style={styles.settingIcon} />
              <Text style={styles.settingTitle}>About MedTrack</Text>
            </View>
            <View style={styles.settingItemRight}>
              <Text style={styles.versionText}>v2.4.1</Text>
            </View>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 20,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 8,
  },
  versionText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  }
});

export default SettingsScreen;
