# 🎵 SPlayer Mobile

SPlayer 的移动端版本，一个现代化的音乐播放应用，基于 Vue 3 + Ionic + Capacitor 开发。

![License](https://img.shields.io/github/license/imsyy/SPlayer)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-green)

## ✨ 特性

- 🎨 **现代化 UI** - 基于 Ionic Vue 的原生移动端体验
- 🎵 **完整音乐功能** - 播放、暂停、上一首、下一首、进度控制
- 📱 **跨平台支持** - 支持 Android 和 iOS
- 🔍 **搜索功能** - 歌曲、歌手、专辑搜索
- 📋 **歌单管理** - 创建、编辑、删除歌单
- ❤️ **收藏功能** - 收藏喜欢的歌曲和歌单
- 🎯 **每日推荐** - 个性化音乐推荐
- 🎨 **主题切换** - 支持明暗主题
- 📊 **排行榜** - 热门音乐排行榜
- 👤 **用户系统** - 登录、个人资料管理
- 🎧 **迷你播放器** - 全局音乐控制
- 📱 **响应式设计** - 适配各种屏幕尺寸

## 🛠 技术栈

### 前端框架
- **Vue 3** - 渐进式 JavaScript 框架
- **Ionic Vue** - 移动端 UI 组件库
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速构建工具

### 移动端开发
- **Capacitor** - 跨平台移动应用开发框架
- **Android Studio** - Android 开发环境
- **Xcode** - iOS 开发环境（macOS）

### 状态管理
- **Pinia** - Vue 3 状态管理库
- **pinia-plugin-persistedstate** - 状态持久化

### 音频处理
- **Howler.js** - Web 音频库
- **原生音频 API** - 移动端音频播放

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm 或 yarn
- Android Studio（Android 开发）
- Xcode（iOS 开发，仅 macOS）

### 安装依赖
```bash
cd mobile
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 启动后端代理服务器
```bash
cd netease-proxy-server
npm start
```

## 📱 APK 打包

### 一键打包命令
```bash
cd mobile
npm run build && npx cap sync android && cd android && ./gradlew assembleDebug
```

### APK 文件位置
构建完成后，APK 文件位于：
```
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

## 🍎 iOS 打包

### 构建步骤
```bash
cd mobile
npm run build && npx cap sync ios && npx cap open ios
```

然后在 Xcode 中配置签名并构建应用。

## 🔌 API 集成

### 网易云音乐 API
- **歌曲搜索** - `/api/search`
- **歌曲详情** - `/api/song/detail`
- **歌曲播放链接** - `/api/song/url/v1`
- **歌单详情** - `/api/playlist/detail`
- **歌手信息** - `/api/artist/detail`
- **专辑信息** - `/api/album/detail`
- **排行榜** - `/api/toplist_detail`
- **每日推荐** - `/api/recommend/songs`
- **用户登录** - `/api/login/cellphone`

### 后端服务
- **代理服务器** - `netease-proxy-server`
- **API 基础地址** - `https://netease-proxy-server.onrender.com/api`
- **本地开发** - `http://localhost:3000/api`

### 多源音乐支持
- **网易云音乐** - 主要音源
- **酷我音乐** - 备用音源（解锁功能）
- **自动切换** - 无版权歌曲自动切换音源

## 📁 项目结构

```
mobile/
├── src/
│   ├── api/                 # API 接口
│   │   ├── discover.ts      # 发现页面 API
│   │   ├── index.ts         # API 配置
│   │   ├── music.ts         # 音乐相关 API
│   │   ├── multiSourceMusic.ts # 多源音乐 API
│   │   └── radio.ts         # 电台 API
│   ├── assets/              # 静态资源
│   │   ├── styles/          # 全局样式
│   │   └── theme/           # 主题配置
│   ├── components/          # 公共组件
│   │   └── Player/          # 播放器组件
│   ├── layouts/             # 布局组件
│   ├── stores/              # 状态管理
│   │   ├── album.ts         # 专辑状态
│   │   ├── artist.ts        # 歌手状态
│   │   ├── music.ts         # 音乐播放状态
│   │   ├── playlist.ts      # 歌单状态
│   │   └── user.ts          # 用户状态
│   ├── views/               # 页面组件
│   │   ├── Home/            # 首页
│   │   ├── Discover/        # 发现页面
│   │   ├── Player/          # 播放页面
│   │   ├── Search/          # 搜索页面
│   │   └── Profile/         # 个人页面
│   └── router/              # 路由配置
├── android/                 # Android 项目
├── ios/                     # iOS 项目
├── public/                  # 公共资源
└── dist/                    # 构建输出
```

## 🔧 配置说明

### Capacitor 配置 (capacitor.config.ts)
```typescript
const config: CapacitorConfig = {
  appId: 'com.splayer.mobile',
  appName: 'SPlayer Mobile',
  webDir: 'dist',
  server: {
    allowNavigation: [
      'https://netease-proxy-server.onrender.com',
      'https://*.music.126.net',
      'https://*.netease.com'
    ]
  },
  android: {
    allowMixedContent: true,
    useCleartextTraffic: true
  }
};
```

### 环境变量
开发环境会自动检测并使用相应的 API 地址：
- **浏览器环境**: 使用代理 `/api`
- **APK 环境**: 使用远程服务器 `https://netease-proxy-server.onrender.com/api`

## 🎯 主要功能

### 音乐播放
- ✅ 播放/暂停控制
- ✅ 上一首/下一首
- ✅ 进度条控制
- ✅ 音量控制
- ✅ 播放模式切换（顺序、随机、单曲循环）
- ✅ 后台播放支持

### 音乐发现
- ✅ 每日推荐歌曲
- ✅ 热门排行榜
- ✅ 新歌速递
- ✅ 歌手推荐
- ✅ 歌单广场

### 搜索功能
- ✅ 歌曲搜索
- ✅ 歌手搜索
- ✅ 专辑搜索
- ✅ 歌单搜索
- ✅ 搜索历史

### 用户功能
- ✅ 手机号登录
- ✅ 个人资料
- ✅ 收藏管理
- ✅ 播放历史

## 🎯 开发进度

### ✅ 已完成
- [x] 项目基础架构搭建
- [x] Ionic + Vue 3 + Capacitor 环境配置
- [x] 底部导航栏组件
- [x] 首页布局和组件
- [x] 迷你播放器组件
- [x] 全屏播放器实现
- [x] 基础状态管理Store
- [x] 路由配置
- [x] API层适配
- [x] 搜索功能
- [x] 歌单详情页
- [x] 歌手详情页
- [x] 专辑详情页
- [x] 用户登录功能
- [x] 音乐播放逻辑
- [x] APK 打包配置

### 🚧 进行中
- [ ] 离线缓存功能
- [ ] 歌词显示功能
- [ ] 音频可视化
- [ ] 性能优化

### 📋 待开发
- [ ] iOS 平台优化
- [ ] PWA支持
- [ ] 应用商店发布

## 🐛 已知问题

- [ ] iOS 平台音频播放优化
- [ ] 离线缓存功能
- [ ] 歌词显示功能
- [ ] 音频可视化

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目基于 [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html) 许可证开源。

## 📢 免责声明

本项目仅供学习和研究使用，不得用于商业用途。使用本项目所产生的一切后果由使用者自行承担。
