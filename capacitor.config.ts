import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orkanhaliloglu.sorusayim',
  appName: 'Soru Sayim',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      "*.firebaseapp.com",
      "*.googleapis.com"
    ]
  },
    ]
  }
};

export default config;
