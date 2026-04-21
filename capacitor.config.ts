
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.revo.tabetotto',
  appName: 'たべとっと。',
  webDir: 'dist',
  plugins: {
    AdMob: {
      androidAppId: 'ca-app-pub-3081007845343649~1937834329',
    }
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#fdfbf7',
    webContentsDebuggingEnabled: false
  }
};

export default config;
