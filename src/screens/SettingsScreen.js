import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { StorageService } from '../services/StorageService';
import NotificationService from '../services/NotificationService';
import CustomModal from '../components/CustomModal';
import DateTimePicker from '@react-native-community/datetimepicker';
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
    dailySummaryTime: '20:00',
    doseAlerts: true,
    soundVibration: true,
  });

  const [snoozeModalVisible, setSnoozeModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

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
    if (key === 'doseAlerts' || key === 'dailySummary' || key === 'dailySummaryTime') {
      await NotificationService.syncAllAlarms();
      await NotificationService.scheduleDailySummary();
    }
  };

  const handleSnoozeDurationClick = () => {
    setSnoozeModalVisible(true);
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === 'Off') return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      updateSetting('dailySummaryTime', `${hours}:${minutes}`);
    }
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
          {renderToggleItem(<DailySummaryIcon width={20} height={20} color="#6B7280" />, 'Daily Summary', 'dailySummary')}
          {settings.dailySummary && (
            <>
              <View style={styles.divider} />
              {renderChevronItem(
                <View style={{ width: 20, height: 20 }} />,
                'Summary Time',
                formatTime(settings.dailySummaryTime),
                () => setShowTimePicker(true)
              )}
            </>
          )}
          <View style={styles.divider} />
          {renderToggleItem(<DoseAlertsIcon width={20} height={20} color="#6B7280" />, 'Dose Alerts', 'doseAlerts')}
          <View style={styles.divider} />
          {renderToggleItem(<SoundVibrationIcon width={20} height={20} color="#6B7280" />, 'Sound & Vibration', 'soundVibration')}
        </View>


        {renderSectionHeader('SUPPORT & ABOUT')}
        <View style={styles.sectionCard}>
          {renderChevronItem(<HelpCenterIcon width={20} height={20} color="#6B7280" />, 'Help Center', null, () => setHelpModalVisible(true))}
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

      <CustomModal
        visible={snoozeModalVisible}
        onClose={() => setSnoozeModalVisible(false)}
        title="Snooze Duration"
        message="Select default snooze time"
        options={[
          { text: '5 minutes', onPress: () => updateSetting('snoozeDuration', 5) },
          { text: '15 minutes', onPress: () => updateSetting('snoozeDuration', 15) },
          { text: '30 minutes', onPress: () => updateSetting('snoozeDuration', 30) },
          { text: 'Cancel', style: 'cancel' }
        ]}
      />

      {showTimePicker && (
        <DateTimePicker
          value={
            settings.dailySummaryTime && settings.dailySummaryTime !== 'Off'
              ? (() => {
                const d = new Date();
                const [h, m] = settings.dailySummaryTime.split(':').map(Number);
                d.setHours(h, m, 0, 0);
                return d;
              })()
              : new Date()
          }
          mode="time"
          display="spinner"
          onChange={handleTimeChange}
        />
      )}

      <CustomModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title="Help Center"
        message="Need help with MedTrack? Contact our support team for assistance."
        options={[
          {
            text: 'Email Support', onPress: () => {
              setHelpModalVisible(false);
              Linking.openURL('mailto:support@medtrack.com?subject=MedTrack Support');
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]}
      />
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
