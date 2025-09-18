import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.splayer.mobile',
  appName: 'SPlayer Mobile',
  webDir: 'dist',
  server: {
    // 允许外部URL访问
    allowNavigation: [
      'https://netease-proxy-server.onrender.com',
      'https://*.music.126.net',
      'https://*.netease.com',
      'http://*.music.126.net'
    ]
  },
  android: {
    // 允许HTTP请求和混合内容
    allowMixedContent: true,
    // 允许明文流量
    useCleartextTraffic: true
  }
};

export default config;
