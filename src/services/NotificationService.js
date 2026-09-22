import notifee, { TriggerType, AndroidImportance, RepeatFrequency } from '@notifee/react-native';
import { StorageService } from './StorageService';

class NotificationService {
  constructor() {
    this.channelId = null;
  }

  async init() {
    // Request permissions (required for iOS and Android 13+)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    this.channelId = await notifee.createChannel({
      id: 'pill-reminders',
      name: 'Pill Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  async scheduleMedicationAlarms(medicine) {
    if (medicine.frequency === 'As Needed') return;
    
    const settings = StorageService.getSettings();
    if (!settings.doseAlerts) return;

    if (!this.channelId) await this.init();

    // Clear existing triggers for this medicine if any (simple implementation: we don't track notification IDs yet, 
    // but in a production app we'd map medicine ID to notification IDs to cancel them on edit/delete)

    for (let i = 0; i < medicine.reminders.length; i++) {
      const reminderIso = medicine.reminders[i];
      const reminderDate = new Date(reminderIso);
      
      // Calculate the next occurrence
      const now = new Date();
      let triggerDate = new Date();
      triggerDate.setHours(reminderDate.getHours(), reminderDate.getMinutes(), 0, 0);

      // If time has passed today, schedule for tomorrow
      if (triggerDate.getTime() <= now.getTime()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
        repeatFrequency: medicine.frequency === 'Daily' ? RepeatFrequency.DAILY : RepeatFrequency.WEEKLY,
      };

      await notifee.createTriggerNotification(
        {
          id: `${medicine.id}-${i}`,
          title: '💊 Time to take your medication!',
          body: `It's time to take ${medicine.strength}${medicine.unit} of ${medicine.name}.`,
          android: {
            channelId: this.channelId,
            importance: AndroidImportance.HIGH,
            actions: [
              {
                title: 'Take',
                pressAction: { id: 'take' },
              },
              {
                title: 'Snooze',
                pressAction: { id: 'snooze' },
              },
            ],
          },
        },
        trigger,
      );
    }
  }

  async cancelAlarms(medicineId) {
    // To implement: cancel all triggers that start with medicineId
    const triggerIds = await notifee.getTriggerNotificationIds();
    const toCancel = triggerIds.filter(id => id.startsWith(medicineId));
    if (toCancel.length > 0) {
      await notifee.cancelTriggerNotifications(toCancel);
    }
  }

  async syncAllAlarms() {
    const settings = StorageService.getSettings();
    await notifee.cancelAllNotifications();
    
    if (settings.doseAlerts) {
      const medicines = StorageService.getMedicines();
      for (const med of medicines) {
        await this.scheduleMedicationAlarms(med);
      }
    }
  }
}

export default new NotificationService();
