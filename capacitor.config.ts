import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aarizo.app',
  appName: 'AARIZO',
  webDir: 'dist',
  backgroundColor: '#083B56',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#083B56',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#083B56',
      showSpinner: false,
    },
  },
};

export default config;
