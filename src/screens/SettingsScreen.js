import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { StorageService } from '../services/StorageService';
import NotificationService from '../services/NotificationService';
import SnoozeIcon from '../assets/settings/Container (1).svg';
import PillImageIcon from '../assets/settings/Container (2).svg';
import DailySummaryIcon from '../assets/settings/Container (3).svg';
import DoseAlertsIcon from '../assets/settings/Container (4).svg';
import SoundVibrationIcon from '../assets/settings/Container (5).svg';
import DataExportIcon from '../assets/settings/Container (6).svg';
import HelpCenterIcon from '../assets/settings/Container (7).svg';
import AboutIcon from '../assets/settings/Container (8).svg';
import ChevronRightIcon from '../assets/settings/Container (9).svg';
import RefillReminderIcon from '../assets/settings/Container.svg';
import BackIcon from '../assets/settings/back.svg';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    refillReminders: true,
    snoozeDuration: 15,
    pillImageDisplay: true,
    dailySummary: true,
    doseAlerts: true,
    soundVibration: true,
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
        {typeof icon === 'string' ? (
          <Icon name={icon} size={20} color="#6B7280" style={styles.settingIcon} />
        ) : (
          <View style={styles.settingIcon}>{icon}</View>
        )}
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
        {typeof icon === 'string' ? (
          <Icon name={icon} size={20} color="#6B7280" style={styles.settingIcon} />
        ) : (
          <View style={styles.settingIcon}>{icon}</View>
        )}
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingItemRight}>
        {valueText ? <Text style={styles.settingValueText}>{valueText}</Text> : null}
        <ChevronRightIcon width={12} height={12} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
          <BackIcon width={16} height={16} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.brandTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {renderSectionHeader('MEDICATION PREFERENCES')}
        <View style={styles.sectionCard}>
          {renderToggleItem(<RefillReminderIcon width={20} height={20} color="#6B7280" />, 'Refill Reminders', 'refillReminders')}
          <View style={styles.divider} />
          {renderChevronItem(<SnoozeIcon width={20} height={20} color="#6B7280" />, 'Snooze Duration', `${settings.snoozeDuration} mins`, handleSnoozeDurationClick)}
          <View style={styles.divider} />
          {renderToggleItem(<PillImageIcon width={20} height={20} color="#6B7280" />, 'Pill Image Display', 'pillImageDisplay')}
        </View>

        {renderSectionHeader('NOTIFICATIONS')}
        <View style={styles.sectionCard}>
          {renderChevronItem(<DailySummaryIcon width={20} height={20} color="#6B7280" />, 'Daily Summary', null, () => {})}
          <View style={styles.divider} />
          {renderToggleItem(<DoseAlertsIcon width={20} height={20} color="#6B7280" />, 'Dose Alerts', 'doseAlerts')}
          <View style={styles.divider} />
          {renderChevronItem(<SoundVibrationIcon width={20} height={20} color="#6B7280" />, 'Sound & Vibration', null, () => {})}
        </View>

        {renderSectionHeader('SECURITY & PRIVACY')}
        <View style={styles.sectionCard}>
          {renderChevronItem(<DataExportIcon width={20} height={20} color="#6B7280" />, 'Data Export', null, () => {})}
        </View>

        {renderSectionHeader('SUPPORT & ABOUT')}
        <View style={styles.sectionCard}>
          {renderChevronItem(<HelpCenterIcon width={20} height={20} color="#6B7280" />, 'Help Center', null, () => {})}
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.settingIcon}><AboutIcon width={20} height={20} color="#6B7280" /></View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    padding: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0285FF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0285FF',
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
