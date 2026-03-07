<template>
  <!-- Entry Portal: full-screen, no sidebar -->
  <div v-if="isFullscreen" class="fullscreen-layout">
    <router-view v-slot="{ Component, route: r }">
      <Transition :name="transitionName" mode="out-in">
        <component :is="Component" :key="r.fullPath" />
      </Transition>
    </router-view>
  </div>

  <!-- Normal workspace layout: sidebar + main -->
  <el-container v-else class="layout-container">
    <!-- Dynamic Background Elements -->
    <div class="tech-background-complete">
      <div class="grid-background"></div>
      <div class="particles-container">
        <div class="particle particle-sm" v-for="i in 10" :key="'sm-' + i"></div>
        <div class="particle particle-md" v-for="i in 8" :key="'md-' + i"></div>
      </div>
      <div class="glow-orbs">
        <div class="glow-orb glow-orb-purple"></div>
        <div class="glow-orb glow-orb-cyan"></div>
      </div>
    </div>

    <!-- 左侧侧边栏 - Liquid Glass -->
    <el-aside width="260px" class="sidebar glass-sidebar">
      <!-- Logo Section -->
      <div class="logo">
        <div class="logo-icon">
          <span class="logo-text">CA</span>
        </div>
        <h2>{{ t('app.title') }}</h2>
        <div class="logo-subtitle">AI Evaluation Platform</div>
      </div>

      <!-- Navigation Menu -->
      <el-menu
        :default-active="currentRoute"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/tasks/new">
          <span class="menu-text">{{ t('menu.createTask') }}</span>
        </el-menu-item>

        <el-menu-item index="/tasks/history">
          <span class="menu-text">{{ t('menu.taskHistory') }}</span>
        </el-menu-item>
      </el-menu>

      <!-- 底部配置信息 -->
      <div class="sidebar-footer">
        <!-- 语言切换 -->
        <div class="language-switcher">
          <el-select v-model="currentLocale" size="small" @change="handleLanguageChange">
            <el-option label="中文" value="zh-CN">
              <span>🇨🇳 中文</span>
            </el-option>
            <el-option label="English" value="en-US">
              <span>🇺🇸 English</span>
            </el-option>
          </el-select>
        </div>

        <el-divider />
        <div class="config-info">
          <div class="info-row">
            <span class="info-label">{{ t('app.user') }}</span>
            <span class="info-value">{{ user }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('app.server') }}</span>
            <el-tooltip :content="serverUrl" placement="top">
              <span class="info-value server-url">{{ serverUrl }}</span>
            </el-tooltip>
          </div>
        </div>

        <!-- Connection Status Indicator -->
        <div class="connection-status">
          <span class="status-dot"></span>
          <span class="status-text">Connected</span>
        </div>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <el-main class="main-content">
        <router-view v-slot="{ Component, route: r }">
          <Transition name="workspace-fade" mode="out-in">
            <component :is="Component" :key="r.fullPath" />
          </Transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from './stores/task'
import { ElMessage } from 'element-plus'

const route = useRoute()
const taskStore = useTaskStore()
const { t, locale } = useI18n()

const currentRoute = computed(() => route.path)
const user = computed(() => taskStore.user)
const serverUrl = computed(() => taskStore.serverUrl)

// 判断是否全屏布局（入口页）
const isFullscreen = computed(() => route.meta?.layout === 'fullscreen')

// 过渡名：入口页 -> 工作台用 portal-enter，工作台内部用 workspace-fade
const transitionName = computed(() =>
  route.meta?.layout === 'fullscreen' ? 'portal-enter' : 'portal-enter'
)

// 当前语言
const currentLocale = ref(locale.value)

// 切换语言
const handleLanguageChange = (lang: string) => {
  locale.value = lang
  localStorage.setItem('language', lang)
  
  // 提示用户刷新页面以应用 Element Plus 语言切换
  ElMessage.warning({
    message: lang === 'zh-CN' ? '语言已切换，部分组件需要刷新页面生效' : 'Language switched, please refresh the page for full effect',
    duration: 3000,
    showClose: true
  })
  
  // 自动刷新页面
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}
</script>

<style scoped>
/* ============================================
   FULLSCREEN LAYOUT (EntryPortal)
   ============================================ */
.fullscreen-layout {
  width: 100vw;
  height: 100vh;
  position: fixed;
  inset: 0;
}

/* Entry -> Workspace transition */
.portal-enter-enter-active {
  transition: opacity 0.5s var(--ease-out-cubic), transform 0.5s var(--ease-out-cubic);
}

.portal-enter-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.portal-enter-enter-from {
  opacity: 0;
  transform: scale(1.04);
}

.portal-enter-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

/* Workspace internal transition */
.workspace-fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s var(--ease-out-cubic);
}

.workspace-fade-leave-active {
  transition: opacity 0.2s ease;
}

.workspace-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.workspace-fade-leave-to {
  opacity: 0;
}

.layout-container {
  height: 100vh;
  width: 100vw;
  position: relative;
}

/* ============================================
   TECH BACKGROUND
   ============================================ */
.tech-background-complete {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}

/* ============================================
   SIDEBAR - LIQUID GLASS
   ============================================ */
.sidebar {
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  height: 100vh;
  z-index: 10;
}

/* Logo Section */
.logo {
  padding: var(--space-xl) var(--space-lg);
  text-align: center;
  border-bottom: 1px solid var(--glass-border);
  position: relative;
}

.logo::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: var(--gradient-horizontal);
  opacity: 0.5;
}

.logo-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--space-md);
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
  position: relative;
  overflow: hidden;
}

.logo-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-shimmer);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

.logo h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.logo-subtitle {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 4px;
}

/* ============================================
   NAVIGATION MENU
   ============================================ */
.sidebar-menu {
  flex: 1;
  border-right: none;
  padding: var(--space-md) var(--space-sm);
}

:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xs);
  color: var(--text-secondary);
  transition: all var(--duration-normal) var(--ease-out-cubic);
}

:deep(.el-menu-item:hover) {
  background: rgba(139, 92, 246, 0.15) !important;
  color: var(--text-primary);
}

:deep(.el-menu-item.is-active) {
  background: var(--gradient-primary) !important;
  color: var(--text-primary);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
}

.menu-text {
  font-weight: 500;
}

/* ============================================
   SIDEBAR FOOTER
   ============================================ */
.sidebar-footer {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  border-top: 1px solid var(--glass-border);
}

:deep(.sidebar-footer .el-divider) {
  border-color: var(--glass-border);
  margin: var(--space-md) 0;
}

.language-switcher {
  padding: var(--space-sm) 0;
}

.language-switcher :deep(.el-select) {
  width: 100%;
}

.language-switcher :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--glass-border);
}

.config-info {
  font-size: 13px;
  color: var(--text-tertiary);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
  padding: var(--space-xs) 0;
}

.info-label {
  opacity: 0.7;
}

.info-value {
  font-weight: 500;
  color: var(--text-secondary);
}

.server-url {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

/* Connection Status */
.connection-status {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-md);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--color-accent-green);
  border-radius: 50%;
  animation: pulse-glow 2s ease-in-out infinite;
}

.status-text {
  font-size: 12px;
  color: var(--color-accent-green-light);
}

/* ============================================
   MAIN CONTENT
   ============================================ */
.main-container {
  position: relative;
}

.main-content {
  padding: var(--space-xl);
  overflow-y: auto;
  height: 100vh;
  background: transparent;
}

.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.2);
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.4);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .sidebar {
    width: 200px !important;
  }

  .logo h2 {
    font-size: 16px;
  }

  .main-content {
    padding: var(--space-md);
  }
}
</style>
