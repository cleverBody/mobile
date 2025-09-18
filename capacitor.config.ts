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
      'https://*.netease.com'
    ]
  },
  android: {
    // 允许HTTP请求（如果需要）
    allowMixedContent: true,
    // 网络安全配置
    useCleartextTraffic: false
  }
};

export default config;
