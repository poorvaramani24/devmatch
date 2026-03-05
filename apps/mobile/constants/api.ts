import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = Constants.expoConfig?.extra ?? {};

// On Android emulator, localhost refers to the emulator itself — use 10.0.2.2 for host machine.
// On iOS simulator, localhost works fine.
// For physical devices, use your machine's LAN IP (e.g. 192.168.x.x).
function getDefaultHost(): string {
  if (__DEV__) {
    // expo-constants exposes the dev server host (e.g. "192.168.1.42:8081")
    const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.experienceUrl ?? '';
    const lanIp = debuggerHost.split(':')[0];

    if (lanIp && lanIp !== 'localhost' && lanIp !== '127.0.0.1') {
      return lanIp;
    }

    if (Platform.OS === 'android') {
      return '10.0.2.2';
    }
  }
  return 'localhost';
}

const host = getDefaultHost();

export const API_URL = extra.apiUrl || `http://${host}:8000`;
export const WS_URL = extra.wsUrl || `ws://${host}:8000`;
