import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aarogyasetukadi.app',
  appName: 'Aarogya Setu Kadi',
  webDir: 'dist/client',
  server: {
    url: 'http://10.103.112.158:3000',
    cleartext: true
  }
};

export default config;
