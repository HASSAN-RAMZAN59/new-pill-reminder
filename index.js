/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
import { StorageService } from './src/services/StorageService';
import NotificationService from './src/services/NotificationService';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  
  if (type === EventType.ACTION_PRESS && pressAction.id) {
    const [medicineId, indexStr] = notification.id.split('-');
    const expectedTime = new Date(notification.android.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = new Date().toISOString().split('T')[0];

    if (pressAction.id === 'take') {
      StorageService.logDose(medicineId, expectedTime, dateString, 'Taken');
      // Decrement inventory
      const meds = StorageService.getMedicines();
      const med = meds.find(m => m.id === medicineId);
      if (med) {
        const newQty = Math.max(0, med.totalQuantity - 1);
        StorageService.updateMedicine(medicineId, { totalQuantity: newQty });
        await NotificationService.checkAndTriggerRefillAlarm(med, newQty);
      }
      await NotificationService.scheduleDailySummary();
      await notifee.cancelNotification(notification.id);
    } else if (pressAction.id === 'snooze') {
      StorageService.logDose(medicineId, expectedTime, dateString, 'Snoozed');
      // Reschedule for configured snooze duration
      const settings = StorageService.getSettings();
      const snoozeMins = settings.snoozeDuration || 15;
      
      const trigger = {
        type: 0, // TIMESTAMP
        timestamp: Date.now() + snoozeMins * 60000, 
      };
      await notifee.createTriggerNotification(notification, trigger);
      await NotificationService.scheduleDailySummary();
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
