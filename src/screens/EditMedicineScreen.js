import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StorageService } from '../services/StorageService';
import NotificationService from '../services/NotificationService';
import CustomModal from '../components/CustomModal';

const EditMedicineScreen = ({ route, navigation }) => {
  const { medicine } = route.params;

  // Initialize state with existing medicine data
  const [totalQuantity, setTotalQuantity] = useState(medicine.totalQuantity.toString());
  const [reminders, setReminders] = useState(medicine.reminders.map(r => new Date(r)));
  
  const [showPickerForIndex, setShowPickerForIndex] = useState(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const addReminderTime = () => {
    setReminders([...reminders, new Date()]);
  };

  const removeReminderTime = (indexToRemove) => {
    setReminders(reminders.filter((_, idx) => idx !== indexToRemove));
  };

  const handleTimeChange = (event, selectedDate, index) => {
    setShowPickerForIndex(null);
    if (selectedDate) {
      const newReminders = [...reminders];
      newReminders[index] = selectedDate;
      setReminders(newReminders);
    }
  };

  const handleSave = async () => {
    if (reminders.length === 0 && medicine.frequency !== 'As Needed') {
      setErrorModalVisible(true);
      return;
    }

    const updatedData = {
      totalQuantity: parseInt(totalQuantity) || 0,
      reminders: reminders.map(r => r.toISOString()),
    };

    StorageService.updateMedicine(medicine.id, updatedData);
    
    // Cancel old alarms and schedule new ones
    await NotificationService.cancelAlarms(medicine.id);
    await NotificationService.scheduleMedicationAlarms({ ...medicine, ...updatedData });
    
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="x" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit {medicine.name}</Text>
        <View style={{width: 24}} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.content}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Inventory</Text>
            
            <Text style={styles.label}>Total Quantity / Stock</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. 30" 
              keyboardType="numeric" 
              value={totalQuantity} 
              onChangeText={setTotalQuantity} 
            />
          </View>

          {medicine.frequency !== 'As Needed' && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Schedule & Reminders</Text>
              
              <View style={styles.remindersSection}>
                <Text style={styles.label}>Reminder Times</Text>
                {reminders.map((time, index) => (
                  <View key={index} style={styles.reminderRow}>
                    <TouchableOpacity style={styles.timePickerBtn} onPress={() => setShowPickerForIndex(index)}>
                      <Icon name="clock" size={16} color="#4B5563" style={{marginRight: 8}} />
                      <Text style={styles.timeText}>
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                    {reminders.length > 1 && (
                      <TouchableOpacity onPress={() => removeReminderTime(index)}>
                        <Icon name="x-circle" size={24} color="#BA1A1A" />
                      </TouchableOpacity>
                    )}
                    {showPickerForIndex === index && (
                      <DateTimePicker
                        value={time}
                        mode="time"
                        display="default"
                        onChange={(event, date) => handleTimeChange(event, date, index)}
                      />
                    )}
                  </View>
                ))}
                <TouchableOpacity style={styles.addTimeBtn} onPress={addReminderTime}>
                  <Icon name="plus" size={16} color="#0285FF" />
                  <Text style={styles.addTimeText}>Add another time</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
            <Text style={styles.primaryBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CustomModal
        visible={errorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        title="Required Field"
        message="Please set at least one reminder time."
        options={[{ text: 'OK', onPress: () => setErrorModalVisible(false) }]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#111827',
  },
  remindersSection: {
    marginTop: 10,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    flex: 1,
    marginRight: 15,
  },
  timeText: {
    fontSize: 16,
    color: '#111827',
  },
  addTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addTimeText: {
    color: '#0285FF',
    fontWeight: '600',
    marginLeft: 5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryBtn: {
    backgroundColor: '#0285FF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditMedicineScreen;
