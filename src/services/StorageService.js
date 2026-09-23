import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

const MEDICINES_KEY = 'medicines';
const LOGS_KEY = 'logs';
const SETTINGS_KEY = 'settings';

export const StorageService = {
  getHasOnboarded: () => {
    return storage.getBoolean('hasOnboarded') || false;
  },
  setHasOnboarded: (val) => {
    storage.set('hasOnboarded', val);
  },
  
  getMedicines: () => {
    const json = storage.getString(MEDICINES_KEY);
    return json ? JSON.parse(json) : [];
  },
  
  addMedicine: (medicine) => {
    const medicines = StorageService.getMedicines();
    medicines.push(medicine);
    storage.set(MEDICINES_KEY, JSON.stringify(medicines));
  },

  updateMedicine: (id, updatedData) => {
    const medicines = StorageService.getMedicines();
    const index = medicines.findIndex(m => m.id === id);
    if (index !== -1) {
      medicines[index] = { ...medicines[index], ...updatedData };
      storage.set(MEDICINES_KEY, JSON.stringify(medicines));
    }
  },

  deleteMedicine: (id) => {
    const medicines = StorageService.getMedicines();
    const filtered = medicines.filter(m => m.id !== id);
    storage.set(MEDICINES_KEY, JSON.stringify(filtered));
  },

  getLogs: () => {
    const json = storage.getString(LOGS_KEY);
    return json ? JSON.parse(json) : {};
  },

  logDose: (medicineId, expectedTime, dateString, status) => {
    // status can be 'Taken', 'Missed', 'Snoozed'
    const logs = StorageService.getLogs();
    if (!logs[dateString]) {
      logs[dateString] = [];
    }
    
    // Check if log already exists for this exact dose
    const existingIndex = logs[dateString].findIndex(
      l => l.medicineId === medicineId && l.expectedTime === expectedTime
    );

    const logEntry = {
      id: existingIndex !== -1 ? logs[dateString][existingIndex].id : Date.now().toString(),
      medicineId,
      expectedTime,
      dateString,
      status,
      actualTime: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      logs[dateString][existingIndex] = logEntry;
    } else {
      logs[dateString].push(logEntry);
    }

    storage.set(LOGS_KEY, JSON.stringify(logs));
  },

  getDailySchedules: (dateString) => {
    const medicines = StorageService.getMedicines();
    const logs = StorageService.getLogs()[dateString] || [];
    
    // Simple logic: we'll show daily meds and PRN meds (as needed).
    // For weekly, we'll check if the day of the week matches the creation day.
    const targetDate = new Date(dateString);
    const targetDay = targetDate.getDay();

    let schedules = [];

    medicines.forEach(med => {
      let appliesToday = false;
      if (med.frequency === 'Daily' || med.frequency === 'As Needed') {
        appliesToday = true;
      } else if (med.frequency === 'Weekly') {
        const createDate = new Date(med.createdAt);
        if (createDate.getDay() === targetDay) {
          appliesToday = true;
        }
      }

      if (appliesToday) {
        if (med.frequency === 'As Needed') {
          // As Needed don't have strict expected times, they just show up
          // We can attach any logs made today for it
          const medLogs = logs.filter(l => l.medicineId === med.id);
          schedules.push({
            ...med,
            expectedTime: null,
            status: medLogs.length > 0 ? 'Taken' : 'Upcoming',
            logs: medLogs
          });
        } else {
          med.reminders.forEach(reminderIso => {
            const reminderDate = new Date(reminderIso);
            // Construct expected time string (HH:mm)
            const hours = reminderDate.getHours().toString().padStart(2, '0');
            const minutes = reminderDate.getMinutes().toString().padStart(2, '0');
            const expectedTime = `${hours}:${minutes}`;

            // Check if there's a log
            const logForDose = logs.find(l => l.medicineId === med.id && l.expectedTime === expectedTime);
            
            let status = 'Upcoming';
            if (logForDose) {
              status = logForDose.status;
            } else {
              // If time has passed, maybe mark missed? For now leave as Upcoming unless explicitly missed
              const now = new Date();
              const [h, m] = expectedTime.split(':').map(Number);
              const doseDate = new Date(targetDate);
              doseDate.setHours(h, m, 0, 0);
              
              if (now > doseDate && dateString !== now.toISOString().split('T')[0]) {
                 // It's a past day
                 status = 'Missed';
              }
            }

            schedules.push({
              ...med,
              expectedTime,
              status,
              logId: logForDose ? logForDose.id : null
            });
          });
        }
      }
    });

    // Sort by time
    return schedules.sort((a, b) => {
      if (!a.expectedTime) return 1;
      if (!b.expectedTime) return -1;
      return a.expectedTime.localeCompare(b.expectedTime);
    });
  },

  getSettings: () => {
    const json = storage.getString(SETTINGS_KEY);
    const defaults = {
      refillReminders: true,
      snoozeDuration: 15,
      pillImageDisplay: true,
      dailySummary: true,
      dailySummaryTime: '20:00',
      doseAlerts: true,
      soundVibration: true,
      biometricLock: false,
    };
    return json ? { ...defaults, ...JSON.parse(json) } : defaults;
  },

  updateSettings: (updates) => {
    const current = StorageService.getSettings();
    storage.set(SETTINGS_KEY, JSON.stringify({ ...current, ...updates }));
  },

  getHasViewedNotifs: () => {
    return storage.getBoolean('hasViewedNotifs') || false;
  },

  setHasViewedNotifs: (value) => {
    storage.set('hasViewedNotifs', value);
  }
};
