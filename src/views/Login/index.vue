<template>
  <IonPage>
    <IonContent :fullscreen="true" class="login-page">
      <!-- 顶部按钮 -->
      <div class="top-buttons">
        <BackButton />

        <IonButton fill="clear" @click="handleGuestLogin" class="guest-btn" :disabled="guestLoading">
          <span v-if="!guestLoading">游客体验</span>
          <div v-else class="loading-spinner"></div>
          <IonIcon :icon="chevronForwardOutline" />
        </IonButton>
      </div>

      <div class="login-container">
        <!-- 上半部分：欢迎区域和表单 -->
        <div class="top-section">
          <!-- 顶部欢迎区域 -->
          <div class="welcome-header">
            <div class="app-logo">
              <IonIcon :icon="musicalNotesOutline" />
            </div>
            <h1 class="greeting">欢迎回来</h1>
            <p class="subtitle s-text-secondary">登录享受完整音乐体验</p>
          </div>

        <!-- 主登录表单 -->
        <div class="main-form">
          <div class="form-content">
            <!-- 手机号输入 -->
            <div class="input-group">
              <div class="input-wrapper">
                <IonIcon :icon="callOutline" class="input-icon" />
                <input
                  v-model="phoneForm.phone"
                  type="tel"
                  placeholder="请输入手机号"
                  class="custom-input"
                  maxlength="11"
                />
              </div>
            </div>

            <!-- 验证码输入 -->
            <div class="input-group">
              <div class="input-wrapper">
                <IonIcon :icon="lockClosedOutline" class="input-icon" />
                <input
                  v-model="verificationCode"
                  type="text"
                  placeholder="请输入验证码"
                  class="custom-input"
                  maxlength="6"
                />
                <button
                  type="button"
                  class="code-btn"
                  @click="sendCode"
                  :disabled="codeLoading || countdown > 0 || phoneForm.phone.length !== 11"
                >
                  <span v-if="countdown > 0">{{ countdown }}s</span>
                  <span v-else-if="codeLoading">发送中...</span>
                  <span v-else>获取验证码</span>
                </button>
              </div>
            </div>

            <!-- 登录按钮 -->
            <button
              class="login-btn"
              @click="handleLogin"
              :disabled="!canLogin"
            >
              <span v-if="!loginLoading">登录</span>
              <div v-else class="loading-spinner"></div>
            </button>

            <!-- 社交登录图标 -->
            <div class="social-icons">
              <button class="social-icon wechat" @click="loginWithWechat" title="微信登录">
                <IonIcon :icon="logoWechat" />
              </button>
              <button class="social-icon apple" @click="loginWithApple" title="Apple登录">
                <IonIcon :icon="logoApple" />
              </button>
            </div>
          </div>
        </div>
        </div>

        <!-- 下半部分：注册和协议 -->
        <div class="bottom-section">
          <!-- 注册提示 -->
          <div class="register-section">
            <p class="register-text">
              还没有账号？
              <button class="register-link" @click="goToRegister">立即注册</button>
            </p>
          </div>

          <!-- 用户协议 -->
          <div class="terms-section">
            <p class="terms-text">
              登录即表示同意
              <a href="#" @click="showTerms">用户协议</a>
              和
              <a href="#" @click="showPrivacy">隐私政策</a>
            </p>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  toastController
} from '@ionic/vue'
import {
  musicalNotesOutline,
  callOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  qrCodeOutline,
  refreshOutline,
  personOutline,
  personAddOutline,
  chevronForwardOutline,
  logoWechat,
  logoApple
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useSwipeBack } from '@/composables/useSwipeBack'
import BackButton from '@/components/common/BackButton.vue'

const router = useRouter()
const userStore = useUserStore()

// 启用侧滑返回
const { goBack } = useSwipeBack()

// 登录方式
const loginMethods = [
  { value: 'phone', label: '手机号', icon: callOutline },
  { value: 'email', label: '邮箱', icon: mailOutline },
  { value: 'qr', label: '扫码', icon: qrCodeOutline }
]

const loginMethod = ref('phone')
const verificationCode = ref('')
const countdown = ref(0)
const codeLoading = ref(false)
const loginLoading = ref(false)
const guestLoading = ref(false)

const phoneForm = ref({
  phone: '',
  password: '',
  phoneError: '',
  passwordError: ''
})

const emailForm = ref({
  email: '',
  password: ''
})

// 计算属性
const canLogin = computed(() => {
  return phoneForm.value.phone.length === 11 && verificationCode.value.length >= 4
})

// 方法
const sendCode = async () => {
  if (!phoneForm.value.phone || phoneForm.value.phone.length !== 11) {
    const toast = await toastController.create({
      message: '请输入正确的手机号',
      duration: 2000,
      position: 'bottom',
      color: 'warning'
    })
    await toast.present()
    return
  }

  codeLoading.value = true
  try {
    await userStore.sendCaptcha(phoneForm.value.phone)

    const toast = await toastController.create({
      message: '验证码已发送',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    })
    await toast.present()

    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)

  } catch (error) {
    const toast = await toastController.create({
      message: '发送失败，请重试',
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    })
    await toast.present()
  } finally {
    codeLoading.value = false
  }
}

const handleLogin = async () => {
  loginLoading.value = true
  try {
    await userStore.loginWithCaptcha(phoneForm.value.phone, verificationCode.value)

    const toast = await toastController.create({
      message: '登录成功',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    })
    await toast.present()

    router.push('/tabs/home')
  } catch (error) {
    console.error('登录失败:', error)
    const toast = await toastController.create({
      message: '登录失败，请检查验证码',
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    })
    await toast.present()
  } finally {
    loginLoading.value = false
  }
}

const handleGuestLogin = async () => {
  guestLoading.value = true
  try {
    await userStore.loginAsGuest()

    const toast = await toastController.create({
      message: '游客登录成功，开始体验音乐之旅！',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    })
    await toast.present()

    router.push('/tabs/home')
  } catch (error) {
    const toast = await toastController.create({
      message: '游客登录失败，请重试',
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    })
    await toast.present()
  } finally {
    guestLoading.value = false
  }
}

const refreshQR = () => {
  console.log('刷新二维码')
}

const forgotPassword = () => {
  console.log('忘记密码')
}

const loginWithWechat = () => {
  console.log('微信登录')
}

const loginWithApple = () => {
  console.log('Apple登录')
}

const goToRegister = () => {
  console.log('跳转注册')
}

const showTerms = () => {
  console.log('显示用户协议')
}

const showPrivacy = () => {
  console.log('显示隐私政策')
}
</script>

<style scoped>
.login-page {
  background: var(--s-background);
}

.login-container {
  padding: 12px 16px 16px 16px;
  max-width: 100%;
  margin: 0 auto;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bottom-section {
  flex-shrink: 0;
}

/* 顶部按钮 */
.top-buttons {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

ion-button.back-btn {
  --color: var(--s-text-primary);
  --background: var(--s-surface);
  --border-radius: 50%;
  width: 44px;
  height: 44px;
  --box-shadow: 0 2px 8px var(--s-shadow);
}

ion-button.guest-btn {
  --color: var(--s-text-secondary);
  --background: var(--s-surface);
  --border-radius: 20px;
  width: auto;
  height: 36px;
  --padding-start: 12px;
  --padding-end: 8px;
  --box-shadow: 0 2px 8px var(--s-shadow);
  font-size: 13px;
  font-weight: 500;
}

.guest-btn ion-icon {
  margin-left: 4px;
  font-size: 16px;
}

/* 欢迎头部 - 参照首页样式 */
.welcome-header {
  margin-bottom: 20px;
  padding: 4px 0;
  text-align: center;
}

.app-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--s-primary) 0%, var(--s-primary-dark) 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 4px 16px var(--s-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-logo:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--s-shadow);
}

.app-logo ion-icon {
  font-size: 40px;
  color: white;
}

.greeting {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--s-text-primary) 0%, var(--s-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 15px;
  margin: 0;
  color: var(--s-text-secondary);
  font-weight: 400;
  letter-spacing: 0.2px;
}



/* 主登录表单 */
.main-form {
  background: var(--s-surface);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px var(--s-shadow);
  position: relative;
  flex: 1;
}

.input-group {
  margin-bottom: 16px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--s-surface);
  border: 1.5px solid #d0d0d0;
  border-radius: 12px;
  padding: 0 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 320px;
  margin: 0 auto;
}

.input-wrapper:focus-within {
  border-color: var(--s-primary);
  box-shadow: 0 0 0 1px var(--s-primary-light);
}

.input-icon {
  color: #6c757d;
  font-size: 20px;
  margin-right: 12px;
}

.custom-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0;
  font-size: 15px;
  color: var(--s-text-primary);
  outline: none;
}

.custom-input::placeholder {
  color: #6c757d;
}

.password-toggle {
  border: none;
  background: transparent;
  color: #6c757d;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.input-error {
  color: var(--ion-color-danger);
  font-size: 14px;
  margin-top: 8px;
  margin-left: 16px;
}

/* 验证码按钮 */
.code-btn {
  border: none;
  background: var(--s-surface-variant);
  color: var(--s-text-secondary);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.code-btn:not(:disabled) {
  background: var(--s-primary);
  color: white;
}

.code-btn:disabled {
  background: var(--s-surface-variant);
  color: var(--s-text-secondary);
  cursor: not-allowed;
}

/* 社交登录图标 */
.social-icons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.social-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.social-icon:active {
  transform: scale(0.9);
}

.social-icon.wechat {
  background: #07c160;
  color: white;
}

.social-icon.apple {
  background: #000;
  color: white;
}

.social-icon ion-icon {
  font-size: 14px;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark {
  background: var(--s-primary);
  border-color: var(--s-primary);
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-label {
  font-size: 14px;
  color: #666;
}

.forgot-link {
  border: none;
  background: transparent;
  color: var(--s-primary);
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

/* 二维码内容 */
.qr-content {
  text-align: center;
}

.qr-wrapper {
  margin-bottom: 24px;
}

.qr-code {
  width: 200px;
  height: 200px;
  margin: 0 auto 24px;
  border: 2px dashed #ddd;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.qr-placeholder ion-icon {
  font-size: 48px;
  color: #6c757d;
  margin-bottom: 8px;
}

.qr-placeholder p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.qr-instructions {
  text-align: left;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 16px;
}

.qr-instructions h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

.qr-instructions ol {
  margin: 0;
  padding-left: 20px;
  color: #666;
}

.qr-instructions li {
  margin-bottom: 8px;
  font-size: 14px;
}

.refresh-qr-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 2px solid var(--s-primary);
  color: var(--s-primary);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.refresh-qr-btn:hover {
  background: var(--s-primary);
  color: white;
}

/* 操作按钮区域 */
.action-section {
  margin-bottom: 32px;
}

.login-btn {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  background: var(--s-primary);
  border: none;
  border-radius: 24px;
  padding: 14px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--s-shadow);
  display: block;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--s-shadow);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.guest-btn {
  width: 100%;
  background: transparent;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 14px 16px;
  color: #6c757d;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.guest-btn:hover:not(:disabled) {
  border-color: var(--s-primary);
  color: var(--s-primary);
  background: var(--s-primary-tint);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 其他登录方式 */
.alternative-login {
  margin-bottom: 32px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--s-surface-variant);
}

.divider span {
  background: var(--s-background);
  padding: 0 16px;
  color: var(--s-text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.social-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  border: 2px solid var(--s-surface-variant);
  border-radius: 16px;
  background: var(--s-surface);
  color: var(--s-text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--s-shadow);
}

.social-card:active {
  transform: scale(0.95);
}

.social-card.wechat:hover {
  border-color: #07c160;
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
}

.social-card.apple:hover {
  border-color: #000;
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

.social-card.qr:hover {
  border-color: var(--s-primary);
  background: var(--s-primary-light);
  color: var(--s-primary);
}

.social-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--s-surface-variant);
  transition: all 0.3s ease;
}

.social-card.wechat .social-icon {
  background: linear-gradient(135deg, #07c160, #00a651);
  color: white;
}

.social-card.apple .social-icon {
  background: linear-gradient(135deg, #000, #333);
  color: white;
}

.social-card.qr .social-icon {
  background: linear-gradient(135deg, var(--s-primary), var(--s-primary-dark));
  color: white;
}

.social-icon ion-icon {
  font-size: 24px;
}

.social-card span {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

/* 底部区域 */
.footer-section {
  margin-top: auto;
  padding-top: 24px;
}

.register-prompt {
  text-align: center;
  margin-bottom: 16px;
}

.register-prompt span {
  color: #6c757d;
  font-size: 14px;
}

.register-link {
  border: none;
  background: transparent;
  color: var(--s-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 8px;
}

.terms {
  text-align: center;
}

.terms p {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

.terms a {
  color: var(--s-primary);
  text-decoration: none;
}

/* 注册区域 */
.register-section {
  text-align: center;
  margin-bottom: 12px;
}

.register-text {
  margin: 0;
  color: var(--s-text-secondary);
  font-size: 15px;
}

.register-link {
  border: none;
  background: transparent;
  color: var(--s-primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 4px;
}

/* 用户协议 */
.terms-section {
  text-align: center;
  padding-bottom: 8px;
}

.terms-text {
  font-size: 12px;
  color: var(--s-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.terms-text a {
  color: var(--s-primary);
  text-decoration: none;
  font-weight: 500;
}

.terms-text a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 12px 12px 120px 12px;
  }

  .method-selector {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .social-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .app-logo {
    width: 60px;
    height: 60px;
  }

  .greeting {
    font-size: 24px;
  }
}

/* 动画效果 */
.form-content {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
