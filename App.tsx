import React, {useEffect, useState} from 'react';
import {
  View,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import DemoNotificationService from './src/services/DemoNotificationService';
import Config from './src/config/AppConfig';
import DemoNotificationRegistrationService from './src/services/DemoNotificationRegistrationService';
import {
  createAppleRegistrationDescription,
  NotificationHubsClient,
  createFcmRe,
  createFcmV1RegistrationDescription,
} from '@azure/notification-hubs';

const App = () => {
  const connectionString =
    'Endpoint=sb://pk-mobile-push.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=XZPsfuT6z39cxyA5onMo08ngXPGLwRUFz4hIgs79RuA=';
  const hubName = 'PKNotification';

  const client = new NotificationHubsClient(connectionString, hubName);

  const registerDeviceWithAzure = createAppleRegistrationDescription({
    deviceToken:
      'dEIxs8LkRc-fbhnRhOwwno:APA91bGQj5C0iZnBxgl0pmYNgQ3er164ygjefzPgtwCMjJ0pyWtE7MdC-nxgTekEBMbYNM7ukElYscbGBLC5_zkkUcJrSr7IXv0J_gvsq0B61jUXb1E6uuc',
    tags: ['likes_hockey', 'likes_football'],
  });

  // const updatedRegistration = await client.createRegistration(registration);

  // const hub = new NotificationHubsClient(hubName, connectionString);

  // const registerDeviceWithAzure = deviceToken => {
  //   // hub.register(deviceToken, ['tag1', 'tag2'], (error, result) => {
  //   //   if (error) {
  //   //     console.error('Registration failed: ', error);
  //   //   } else {
  //   //     console.log('Registration successful: ', result);
  //   //   }
  //   // });
  //   // hub.createRegistration()
  // };

  // console.log(Config, 'Config---');
  const [status, setStatus] = useState(
    'Push notifications registration status is unknown',
  );
  const [isRegistered, setIsRegistered] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);
  const [registeredOS, setRegisteredOS] = useState<string | null>(null);

  const [deviceIdData, setDeviceIdData] = useState(null);

  const getDeviceId = async () => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();

      setDeviceIdData(deviceId);
      // console.log(deviceId, 'deviceId--');
    } catch (error) {
      console.error('Error getting device ID:', error);
    }
  };

  getDeviceId();

  const notificationService = new DemoNotificationService(
    (token: any) => onTokenReceived(token),
    (notification: any) => onNotificationReceived(notification),
  );

  // console.log(notificationService, 'notificationService---');

  const notificationRegistrationService =
    new DemoNotificationRegistrationService(Config.apiUrl, Config.apiKey);

  const onTokenReceived = (token: any) => {
    console.log(`Token received:`, token);
    setRegisteredToken(token.token);
    setRegisteredOS(token.os);
    setStatus('Push notification token has been received.');
  };

  const onNotificationReceived = (notification: any) => {
    console.log('Notification received:', notification);
    setStatus('Received a push notification.');
    if (notification.data.message) {
      Alert.alert(
        Config.appName,
        `${notification.data.action} action received`,
      );
    }
  };

  const onRegisterButtonPress = async () => {
    if (!registeredToken || !registeredOS) {
      Alert.alert("The push notifications token wasn't received.");
      return;
    }

    setStatus('Registering...');
    setIsBusy(true);

    try {
      const platform = registeredOS === 'ios' ? 'apns' : 'fcmv1';
      const request = {
        installationId: deviceIdData,
        platform,
        pushChannel: registeredToken,
        tags: ['testAccounts'],
      };
      // registration();

      // registerDeviceWithAzure(registeredToken);

      console.log('Request--:', request);

      // const url =
      //   'https://pk-mobile-push.servicebus.windows.net:443/api/notifications/installations';
      // const response = await fetch(url, {
      //   method: 'PUT',
      //   headers: {
      //     Accept: 'application/json',
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(request),
      // });

      // console.log(response, 'response--');

      // const response = await fetch(
      //   `${Config.apiUrl}/notifications/installations`,
      //   {
      //     method: 'PUT',
      //     headers: {
      //       Accept: 'application/json',
      //       'Content-Type': 'application/json',
      //       apiKey: Config.apiKey,
      //     },
      //     body: JSON.stringify(request),
      //   },
      // );

      // if (!response.ok) {
      //   const errorResponse = await response.text();
      //   console.error('Error Response:', errorResponse);
      //   throw new Error(
      //     `HTTP ${response.status}: ${response.statusText}. Details: ${errorResponse}`,
      //   );
      // }

      // const responseData = await response.json();
      // console.log('Response Data:', responseData);

      setStatus(`Registered for ${registeredOS} push notifications`);
      setIsRegistered(true);
    } catch (error) {
      console.log(error, 'error--');
      if (error.message.includes('Network request failed')) {
        console.error(
          'Network Error: Make sure the API URL is correct and accessible.',
        );
      } else {
        console.error('Unexpected Error:', error.message);
      }
      setStatus(`Registration failed: ${error.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const onDeregisterButtonPress = async () => {
    setStatus('Deregistering...');
    setIsBusy(true);

    try {
      await notificationRegistrationService.deregisterAsync(deviceId);
      setStatus('Deregistered from push notifications');
      setIsRegistered(false);
    } catch (e) {
      setStatus(`Deregistration failed: ${e}`);
    } finally {
      setIsBusy(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const testApiCall = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts/1',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      // console.log(responseData, 'responseData--');
      setData(responseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isBusy && <ActivityIndicator />}
      <View style={styles.button}>
        <Button
          title="Register"
          onPress={onRegisterButtonPress}
          disabled={isBusy}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Deregister"
          onPress={onDeregisterButtonPress}
          disabled={isBusy}
        />
      </View>
      <Text style={styles.title}>Test API Call</Text>
      <Button title="Test API" onPress={testApiCall} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {data && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Response Data:</Text>
          <Text style={styles.resultText}>{JSON.stringify(data, null, 2)}</Text>
        </View>
      )}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    marginVertical: 10,
    width: '100%',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    width: '100%',
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    marginTop: 20,
    color: 'red',
  },
});

export default App;
