// src/services/DemoNotificationService.ts
import PushNotification from 'react-native-push-notification';
import notificationHandler from './DemoNotificationHandler';

export default class DemoNotificationService {
  constructor(onTokenReceived: any, onNotificationReceived: any) {
    notificationHandler.attachTokenReceived(onTokenReceived);
    notificationHandler.attachNotificationReceived(onNotificationReceived);

    PushNotification.getApplicationIconBadgeNumber((number: number) => {
      if (number > 0) {
        PushNotification.setApplicationIconBadgeNumber(0);
      }
    });
  }

  checkPermissions(callback: any) {
    return PushNotification.checkPermissions(callback);
  }

  requestPermissions() {
    return PushNotification.requestPermissions();
  }

  cancelNotifications() {
    PushNotification.cancelLocalNotifications();
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }

  abandonPermissions() {
    PushNotification.abandonPermissions();
  }
}
