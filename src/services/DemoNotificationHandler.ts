// src/services/DemoNotificationHandler.ts
import PushNotification from 'react-native-push-notification';

class DemoNotificationHandler {
  private onRegisterCallback: any;
  private onNotificationCallback: any;

  onNotification(notification: any) {
    console.log('NotificationHandler:', notification);
    if (typeof this.onNotificationCallback === 'function') {
      this.onNotificationCallback(notification);
    }
  }

  onRegister(token: any) {
    console.log('NotificationHandler Token:', token);
    if (typeof this.onRegisterCallback === 'function') {
      this.onRegisterCallback(token);
    }
  }

  attachTokenReceived(handler: any) {
    this.onRegisterCallback = handler;
  }

  attachNotificationReceived(handler: any) {
    this.onNotificationCallback = handler;
  }
}

const notificationHandler = new DemoNotificationHandler();

PushNotification.configure({
  onRegister: notificationHandler.onRegister.bind(notificationHandler),
  onNotification: notificationHandler.onNotification.bind(notificationHandler),
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: true,
});

export default notificationHandler;
