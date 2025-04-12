
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.23f2d9ab0ab54c4fbd9e0bd2a150da3e',
  appName: 'locale-suggesto',
  webDir: 'dist',
  server: {
    url: 'https://23f2d9ab-0ab5-4c4f-bd9e-0bd2a150da3e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'key0',
    }
  }
};

export default config;
