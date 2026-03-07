import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
// Import CSS modules in order (variables first, then specialized styles, global last)
import './styles/variables.css'
import './styles/glassmorphism.css'
import './styles/background.css'
import './styles/animations.css'
import './styles/chat-log.css'
import './styles/interactions.css'
import './styles/element-plus-override.css'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 从 localStorage 获取用户语言偏好
const savedLocale = localStorage.getItem('language') || 'zh-CN'
const elementLocale = savedLocale === 'en-US' ? en : zhCn

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(ElementPlus, { locale: elementLocale })

app.mount('#app')
