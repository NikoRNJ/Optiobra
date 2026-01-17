import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.optiobra.app',
  appName: 'OptiObra',
  webDir: 'dist',
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: false,
    },
  },
};

export default config;
