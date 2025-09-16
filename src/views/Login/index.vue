<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/my"></ion-back-button>
        </ion-buttons>
        <ion-title>登录</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="login-content">
      <div class="login-container">
        <!-- Logo区域 -->
        <div class="logo-section">
          <!-- <img src="/images/logo.png" alt="SPlayer" class="logo" /> -->
          <h1 class="app-name">SPlayer</h1>
          <p class="app-slogan">发现好音乐，享受好时光</p>
        </div>
        
        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- 登录方式切换 -->
          <ion-segment v-model="loginMethod" class="login-method">
            <ion-segment-button value="phone">
              <ion-label>手机号登录</ion-label>
            </ion-segment-button>
            <ion-segment-button value="email">
              <ion-label>邮箱登录</ion-label>
            </ion-segment-button>
          </ion-segment>
          
          <!-- 手机号登录 -->
          <div v-if="loginMethod === 'phone'" class="form-fields">
            <ion-item>
              <ion-label position="stacked">手机号</ion-label>
              <ion-input
                v-model="phoneForm.phone"
                type="tel"
                placeholder="请输入手机号"
                :class="{ 'ion-invalid': phoneForm.phoneError }"
                @ion-blur="validatePhone"
                required
              ></ion-input>
              <ion-note v-if="phoneForm.phoneError" slot="error">{{ phoneForm.phoneError }}</ion-note>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">密码</ion-label>
              <ion-input
                v-model="phoneForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                :class="{ 'ion-invalid': phoneForm.passwordError }"
                @ion-blur="validatePassword"
                required
              ></ion-input>
              <ion-button slot="end" fill="clear" @click="togglePassword">
                <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline"></ion-icon>
              </ion-button>
              <ion-note v-if="phoneForm.passwordError" slot="error">{{ phoneForm.passwordError }}</ion-note>
            </ion-item>
            
            <!-- 验证码登录选项 -->
            <div class="captcha-option">
              <ion-checkbox v-model="useCaptcha"></ion-checkbox>
              <ion-label class="captcha-label">使用短信验证码登录</ion-label>
            </div>
            
            <ion-item v-if="useCaptcha">
              <ion-label position="stacked">验证码</ion-label>
              <ion-input
                v-model="phoneForm.captcha"
                type="text"
                placeholder="请输入验证码"
                :maxlength="6"
              ></ion-input>
              <ion-button 
                slot="end" 
                size="small" 
                fill="outline"
                :disabled="!phoneForm.phone || captchaCountdown > 0"
                @click="sendCaptcha"
              >
                {{ captchaCountdown > 0 ? `${captchaCountdown}s` : '发送验证码' }}
              </ion-button>
            </ion-item>
          </div>
          
          <!-- 邮箱登录 -->
          <div v-else class="form-fields">
            <ion-item>
              <ion-label position="stacked">邮箱</ion-label>
              <ion-input
                v-model="emailForm.email"
                type="email"
                placeholder="请输入邮箱"
                :class="{ 'ion-invalid': emailForm.emailError }"
                @ion-blur="validateEmail"
                required
              ></ion-input>
              <ion-note v-if="emailForm.emailError" slot="error">{{ emailForm.emailError }}</ion-note>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">密码</ion-label>
              <ion-input
                v-model="emailForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                :class="{ 'ion-invalid': emailForm.passwordError }"
                @ion-blur="validatePassword"
                required
              ></ion-input>
              <ion-button slot="end" fill="clear" @click="togglePassword">
                <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline"></ion-icon>
              </ion-button>
              <ion-note v-if="emailForm.passwordError" slot="error">{{ emailForm.passwordError }}</ion-note>
            </ion-item>
          </div>
          
          <!-- 登录按钮 -->
          <ion-button 
            type="submit"
            expand="block"
            class="login-button"
            :disabled="!isFormValid || loginLoading"
          >
            <ion-spinner v-if="loginLoading" name="crescent"></ion-spinner>
            <span v-else>登录</span>
          </ion-button>
        </form>
        
        <!-- 其他选项 -->
        <div class="login-options">
          <div class="forgot-password">
            <a href="#" @click="forgotPassword">忘记密码？</a>
          </div>
          
          <div class="register-link">
            <span>还没有账号？</span>
            <a href="#" @click="goToRegister">立即注册</a>
          </div>
        </div>
        
        <!-- 第三方登录 -->
        <div class="third-party-login">
          <div class="divider">
            <span>其他登录方式</span>
          </div>
          
          <div class="social-buttons">
            <ion-button fill="outline" size="large" @click="loginWithWechat">
              <ion-icon :icon="logoWechat" slot="start"></ion-icon>
              微信登录
            </ion-button>
            
            <ion-button fill="outline" size="large" @click="loginWithQQ">
              <ion-icon slot="start">Q</ion-icon>
              QQ登录
            </ion-button>
          </div>
        </div>
        
        <!-- 用户协议 -->
        <div class="terms">
          <p>
            登录即表示同意
            <a href="#" @click="showTerms">用户协议</a>
            和
            <a href="#" @click="showPrivacy">隐私政策</a>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonInput, IonItem, IonLabel, IonNote, IonSegment,
  IonSegmentButton, IonCheckbox, IonSpinner,
  toastController
} from '@ionic/vue'
import { eyeOutline, eyeOffOutline, logoWechat } from 'ionicons/icons'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginMethod = ref<'phone' | 'email'>('phone')
const showPassword = ref(false)
const useCaptcha = ref(false)
const captchaCountdown = ref(0)

const phoneForm = ref({
  phone: '',
  password: '',
  captcha: '',
  phoneError: '',
  passwordError: ''
})

const emailForm = ref({
  email: '',
  password: '',
  emailError: '',
  passwordError: ''
})

const { loginLoading } = userStore

const isFormValid = computed(() => {
  if (loginMethod.value === 'phone') {
    return phoneForm.value.phone && 
           phoneForm.value.password && 
           !phoneForm.value.phoneError && 
           !phoneForm.value.passwordError &&
           (!useCaptcha.value || phoneForm.value.captcha)
  } else {
    return emailForm.value.email && 
           emailForm.value.password && 
           !emailForm.value.emailError && 
           !emailForm.value.passwordError
  }
})

const validatePhone = () => {
  const phone = phoneForm.value.phone
  if (!phone) {
    phoneForm.value.phoneError = '请输入手机号'
  } else if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneForm.value.phoneError = '请输入正确的手机号'
  } else {
    phoneForm.value.phoneError = ''
  }
}

const validateEmail = () => {
  const email = emailForm.value.email
  if (!email) {
    emailForm.value.emailError = '请输入邮箱'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailForm.value.emailError = '请输入正确的邮箱格式'
  } else {
    emailForm.value.emailError = ''
  }
}

const validatePassword = () => {
  const password = loginMethod.value === 'phone' ? phoneForm.value.password : emailForm.value.password
  if (!password) {
    const errorMsg = '请输入密码'
    if (loginMethod.value === 'phone') {
      phoneForm.value.passwordError = errorMsg
    } else {
      emailForm.value.passwordError = errorMsg
    }
  } else if (password.length < 6) {
    const errorMsg = '密码长度不能少于6位'
    if (loginMethod.value === 'phone') {
      phoneForm.value.passwordError = errorMsg
    } else {
      emailForm.value.passwordError = errorMsg
    }
  } else {
    if (loginMethod.value === 'phone') {
      phoneForm.value.passwordError = ''
    } else {
      emailForm.value.passwordError = ''
    }
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const sendCaptcha = async () => {
  if (!phoneForm.value.phone) {
    showToast('请先输入手机号')
    return
  }
  
  try {
    await userStore.sendCaptcha(phoneForm.value.phone)
    showToast('验证码已发送')
    startCountdown()
  } catch (error) {
    showToast('发送失败，请重试')
  }
}

const startCountdown = () => {
  captchaCountdown.value = 60
  const timer = setInterval(() => {
    captchaCountdown.value--
    if (captchaCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleLogin = async () => {
  try {
    if (loginMethod.value === 'phone') {
      if (useCaptcha.value) {
        await userStore.loginWithPhone(
          phoneForm.value.phone, 
          phoneForm.value.password, 
          phoneForm.value.captcha
        )
      } else {
        await userStore.loginWithPhone(phoneForm.value.phone, phoneForm.value.password)
      }
    } else {
      await userStore.loginWithEmail(emailForm.value.email, emailForm.value.password)
    }
    
    showToast('登录成功')
    router.push('/tabs/my')
  } catch (error) {
    showToast(error instanceof Error ? error.message : '登录失败')
  }
}

const forgotPassword = () => {
  showToast('功能开发中')
}

const goToRegister = () => {
  showToast('功能开发中')
}

const loginWithWechat = () => {
  showToast('微信登录功能开发中')
}

const loginWithQQ = () => {
  showToast('QQ登录功能开发中')
}

const showTerms = () => {
  showToast('用户协议功能开发中')
}

const showPrivacy = () => {
  showToast('隐私政策功能开发中')
}

const showToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom'
  })
  await toast.present()
}
</script>

<style scoped>
.login-content {
  --padding-start: 0;
  --padding-end: 0;
}

.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.logo-section {
  text-align: center;
  padding: 40px 0 60px;
}

.logo {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.app-name {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px;
  color: var(--ion-color-primary);
}

.app-slogan {
  font-size: 16px;
  color: var(--ion-color-step-600);
  margin: 0;
}

.login-form {
  flex: 1;
}

.login-method {
  margin-bottom: 24px;
}

.form-fields {
  margin-bottom: 24px;
}

.form-fields ion-item {
  margin-bottom: 16px;
  --border-radius: 8px;
  --background: var(--ion-color-step-50);
}

.captcha-option {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  padding: 0 16px;
}

.captcha-label {
  font-size: 14px;
}

.login-button {
  margin-top: 32px;
  height: 48px;
  --border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

.login-options {
  margin: 24px 0;
  text-align: center;
}

.forgot-password {
  margin-bottom: 16px;
}

.forgot-password a {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-size: 14px;
}

.register-link {
  font-size: 14px;
  color: var(--ion-color-step-600);
}

.register-link a {
  color: var(--ion-color-primary);
  text-decoration: none;
  margin-left: 4px;
}

.third-party-login {
  margin: 32px 0;
}

.divider {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--ion-color-step-200);
}

.divider span {
  background: var(--ion-background-color);
  padding: 0 16px;
  color: var(--ion-color-step-600);
  font-size: 14px;
}

.social-buttons {
  display: flex;
  gap: 12px;
}

.social-buttons ion-button {
  flex: 1;
  height: 44px;
  --border-radius: 22px;
}

.terms {
  text-align: center;
  margin-top: auto;
  padding-top: 20px;
}

.terms p {
  font-size: 12px;
  color: var(--ion-color-step-600);
  line-height: 1.5;
  margin: 0;
}

.terms a {
  color: var(--ion-color-primary);
  text-decoration: none;
}
</style>