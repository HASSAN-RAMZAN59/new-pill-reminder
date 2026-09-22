import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import uuid from 'react-native-uuid';
import { StorageService } from '../services/StorageService';
import NotificationService from '../services/NotificationService';

const TYPES = ['Pill', 'Liquid', 'Injection', 'Capsule', 'Drops'];
const FREQUENCIES = ['Daily', 'Weekly', 'As Needed'];

const AddMedicineScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Pill');
  const [strength, setStrength] = useState('');
  const [unit, setUnit] = useState('mg');
  const [totalQuantity, setTotalQuantity] = useState('');
  
  const [frequency, setFrequency] = useState('Daily');
  const [reminders, setReminders] = useState([new Date()]); // Array of Date objects
  const [showPickerForIndex, setShowPickerForIndex] = useState(null);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

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
    const newMedicine = {
      id: uuid.v4(),
      name,
      type,
      strength,
      unit,
      totalQuantity: parseInt(totalQuantity) || 0,
      frequency,
      reminders: reminders.map(r => r.toISOString()), // Store as ISO strings
      createdAt: new Date().toISOString(),
    };

    StorageService.addMedicine(newMedicine);
    
    // Schedule local alarms
    await NotificationService.scheduleMedicationAlarms(newMedicine);
    
    navigation.goBack();
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basics</Text>
      
      <Text style={styles.label}>Medicine Name</Text>
      <TextInput style={styles.input} placeholder="e.g. Lisinopril" value={name} onChangeText={setName} />

      <Text style={styles.label}>Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {TYPES.map(t => (
          <TouchableOpacity key={t} style={[styles.pillBtn, type === t && styles.pillBtnActive]} onPress={() => setType(t)}>
            <Text style={[styles.pillBtnText, type === t && styles.pillBtnTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <View style={{flex: 1, marginRight: 10}}>
          <Text style={styles.label}>Strength</Text>
          <TextInput style={styles.input} placeholder="10" keyboardType="numeric" value={strength} onChangeText={setStrength} />
        </View>
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={styles.label}>Unit</Text>
          <TextInput style={styles.input} placeholder="mg" value={unit} onChangeText={setUnit} />
        </View>
      </View>

      <Text style={styles.label}>Total Quantity (Inventory)</Text>
      <TextInput style={styles.input} placeholder="30" keyboardType="numeric" value={totalQuantity} onChangeText={setTotalQuantity} />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Schedule & Reminders</Text>

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.frequencyRow}>
        {FREQUENCIES.map(f => (
          <TouchableOpacity key={f} style={[styles.freqBtn, frequency === f && styles.freqBtnActive]} onPress={() => setFrequency(f)}>
            <Text style={[styles.freqBtnText, frequency === f && styles.freqBtnTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {frequency !== 'As Needed' && (
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
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review & Save</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Medicine</Text>
        <Text style={styles.summaryValue}>{name || 'Unnamed'} ({strength}{unit})</Text>
        <View style={styles.divider} />
        
        <Text style={styles.summaryLabel}>Type</Text>
        <Text style={styles.summaryValue}>{type}</Text>
        <View style={styles.divider} />

        <Text style={styles.summaryLabel}>Inventory</Text>
        <Text style={styles.summaryValue}>{totalQuantity || '0'} remaining</Text>
        <View style={styles.divider} />

        <Text style={styles.summaryLabel}>Schedule</Text>
        <Text style={styles.summaryValue}>{frequency}</Text>
        
        {frequency !== 'As Needed' && (
          <View>
            <Text style={styles.summaryLabel}>Times</Text>
            {reminders.map((time, i) => (
              <Text key={i} style={styles.summaryValue}>
                • {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Icon name={step === 1 ? 'x' : 'arrow-left'} size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Medicine</Text>
          <View style={{width: 24}} />
        </View>


        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>

        <ScrollView style={styles.content}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          {step < 3 ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Medicine</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0285FF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    fontSize: 16,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
  },
  horizontalScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  pillBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  pillBtnActive: {
    backgroundColor: '#0285FF',
  },
  pillBtnText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  pillBtnTextActive: {
    color: '#FFFFFF',
  },
  frequencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  freqBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  freqBtnActive: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: '#0285FF',
  },
  freqBtnText: {
    color: '#4B5563',
    fontWeight: '500',
    fontSize: 13,
  },
  freqBtnTextActive: {
    color: '#0285FF',
    fontWeight: '600',
  },
  remindersSection: {
    marginTop: 20,
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
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
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
  saveBtn: {
    backgroundColor: '#006F66',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddMedicineScreen;
