import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import uuid from 'react-native-uuid';
import { launchImageLibrary } from 'react-native-image-picker';

import { StorageService } from '../services/StorageService';
import NotificationService from '../services/NotificationService';
import CustomModal from '../components/CustomModal';

import TrashIcon from '../assets/add med/Container (1).svg';
import PillSvg from '../assets/add med/Container (2).svg';
import LiquidSvg from '../assets/add med/Container (3).svg';
import InjectionSvg from '../assets/add med/Container (4).svg';
import CameraSvg from '../assets/add med/Container.svg';

const TYPES = ['Pill', 'Liquid', 'Injection'];
const FREQUENCIES = ['Daily', 'Weekly'];
const UNITS = ['mg', 'ml', 'mcg', 'g', 'pill(s)', 'drop(s)'];

const AddMedicineScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Pill');
  const [strength, setStrength] = useState('');
  const [unit, setUnit] = useState('mg');
  const [totalQuantity, setTotalQuantity] = useState('');
  
  const [frequency, setFrequency] = useState('Daily');
  const [reminders, setReminders] = useState([new Date()]);
  const [imageUri, setImageUri] = useState(null);

  const [showPickerForIndex, setShowPickerForIndex] = useState(null);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Image picker error: ', error);
    }
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
    if (!name.trim()) {
      setErrorMessage("Please enter a medicine name.");
      setErrorModalVisible(true);
      return;
    }

    if (reminders.length === 0) {
      setErrorMessage("Please set at least one reminder time.");
      setErrorModalVisible(true);
      return;
    }

    const newMedicine = {
      id: uuid.v4(),
      name,
      type,
      strength,
      unit,
      totalQuantity: parseInt(totalQuantity) || 0,
      frequency,
      reminders: reminders.map(r => r.toISOString()),
      imageUri,
      createdAt: new Date().toISOString()
    };

    StorageService.addMedicine(newMedicine);
    await NotificationService.scheduleMedicationAlarms(newMedicine);

    navigation.navigate('Home', { screen: 'Cabinet' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="x" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Medicine</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.headerSaveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Static Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperItem}>
              <View style={styles.stepActive}>
                <Text style={styles.stepNumberActive}>1</Text>
              </View>
              <Text style={styles.stepLabelActive}>Basics</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepperItem}>
              <View style={styles.stepInactive}>
                <Text style={styles.stepNumberInactive}>2</Text>
              </View>
              <Text style={styles.stepLabelInactive}>Schedule</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepperItem}>
              <View style={styles.stepInactive}>
                <Text style={styles.stepNumberInactive}>3</Text>
              </View>
              <Text style={styles.stepLabelInactive}>Review</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Section 1: Medicine Details */}
          <Text style={styles.sectionTitle}>Medicine Details</Text>
          <View style={styles.sectionDivider} />

          <Text style={styles.label}>Medicine Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g., Amoxicillin" 
            placeholderTextColor="#9CA3AF"
            value={name} 
            onChangeText={setName} 
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeSelector}>
            {[
              { id: 'Pill', icon: PillSvg },
              { id: 'Liquid', icon: LiquidSvg },
              { id: 'Injection', icon: InjectionSvg }
            ].map(t => {
              const isActive = type === t.id;
              const SvgIcon = t.icon;
              return (
                <TouchableOpacity 
                  key={t.id}
                  style={[styles.typeBox, isActive && styles.typeBoxActive]}
                  onPress={() => setType(t.id)}
                >
                  <SvgIcon width={24} height={24} color={isActive ? "#0285FF" : "#434655"} style={{marginBottom: 8}} />
                  <Text style={[styles.typeText, isActive && styles.typeTextActive]}>{t.id}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Strength</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g., 500" 
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric" 
                value={strength} 
                onChangeText={setStrength} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Unit</Text>
              <TouchableOpacity onPress={() => setUnitModalVisible(true)} style={styles.inputDropdown}>
                <Text style={styles.inputText}>{unit}</Text>
                <Icon name="chevron-down" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.spacer} />

          {/* Section 2: Schedule & Reminders */}
          <Text style={styles.sectionTitle}>Schedule & Reminders</Text>
          <View style={styles.sectionDivider} />

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.freqSelector}>
            {FREQUENCIES.map(f => (
              <TouchableOpacity 
                key={f}
                style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
                onPress={() => setFrequency(f)}
              >
                <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Reminder Times</Text>
          <View style={styles.remindersBox}>
            {reminders.map((time, index) => (
              <View key={index} style={styles.reminderRow}>
                <TouchableOpacity style={styles.timePickerArea} onPress={() => setShowPickerForIndex(index)}>
                  <Text style={styles.timeTextBold}>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <View style={styles.timeDoseCol}>
                    <Text style={styles.timeDoseText}>
                      {time.getHours() >= 5 && time.getHours() < 12 ? 'Morning' : 
                       time.getHours() >= 12 && time.getHours() < 17 ? 'Afternoon' : 
                       time.getHours() >= 17 && time.getHours() < 21 ? 'Evening' : 'Night'}
                    </Text>
                    <Text style={styles.timeDoseText}>Dose</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeReminderTime(index)} style={styles.trashIconArea}>
                  <TrashIcon width={20} height={20} />
                </TouchableOpacity>
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
          </View>

          <TouchableOpacity style={styles.addTimeBtn} onPress={addReminderTime}>
            <Icon name="plus-circle" size={18} color="#0285FF" />
            <Text style={styles.addTimeText}>Add another time</Text>
          </TouchableOpacity>

          <View style={styles.spacerLarge} />

          {/* Section 3: Appearance (Optional) */}
          <Text style={styles.sectionTitle}>Appearance (Optional)</Text>
          <View style={styles.sectionDivider} />
          
          <Text style={styles.appearanceSub}>Upload a photo of the pill or packaging to help identify it later.</Text>
          
          <TouchableOpacity style={styles.uploadBox} onPress={handleImagePick}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
            ) : (
              <>
                <CameraSvg width={30} height={30} style={{marginBottom: 10}} />
                <Text style={styles.uploadText}>Tap to upload photo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.spacerLarge} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Medicine</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CustomModal
        visible={errorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        title="Required Field"
        message={errorMessage}
        options={[{ text: 'OK', onPress: () => setErrorModalVisible(false) }]}
      />

      <CustomModal
        visible={unitModalVisible}
        onClose={() => setUnitModalVisible(false)}
        title="Select Unit"
        message="Choose a measurement unit:"
        options={[...UNITS.map(u => ({
          text: u,
          style: 'outline',
          onPress: () => { setUnit(u); setUnitModalVisible(false); }
        })), { text: 'Cancel', style: 'cancel' }]}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSaveText: {
    fontSize: 16,
    color: '#0285FF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  stepperItem: {
    alignItems: 'center',
  },
  stepActive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0285FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  stepNumberActive: { color: '#FFF', fontWeight: 'bold' },
  stepInactive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  stepNumberInactive: { color: '#6B7280', fontWeight: 'bold' },
  stepLabelActive: { fontSize: 12, color: '#374151' },
  stepLabelInactive: { fontSize: 12, color: '#9CA3AF' },
  stepLine: {
    width: 40,
    height: 1,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 10,
    marginTop: -20,
  },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 20, marginHorizontal: -20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 15 },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputDropdown: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: { fontSize: 16, color: '#111827' },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F9FAFB',
  },
  typeBoxActive: {
    borderColor: '#0285FF',
    backgroundColor: '#EAF4FF',
  },
  typeText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  typeTextActive: { color: '#0285FF', fontWeight: 'bold' },
  row: { flexDirection: 'row', marginTop: 10 },
  spacer: { height: 30 },
  spacerLarge: { height: 50 },
  freqSelector: { flexDirection: 'row' },
  freqBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  freqBtnActive: {
    borderColor: '#0285FF',
    backgroundColor: '#EAF4FF',
  },
  freqText: { color: '#4B5563', fontWeight: '500' },
  freqTextActive: { color: '#0285FF', fontWeight: 'bold' },
  remindersBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 10,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  timePickerArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTextBold: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginRight: 20 },
  timeDoseCol: { justifyContent: 'center' },
  timeDoseText: { fontSize: 14, color: '#4B5563' },
  trashIconArea: { padding: 10 },
  addTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  addTimeText: { color: '#0285FF', fontWeight: 'bold', marginLeft: 8 },
  appearanceSub: { fontSize: 14, color: '#4B5563', marginBottom: 15 },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#9CA3AF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadText: { fontSize: 14, color: '#4B5563', fontWeight: '600' },
  uploadedImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#4B5563',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: { color: '#111827', fontWeight: 'bold', fontSize: 16 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#0285FF',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default AddMedicineScreen;
