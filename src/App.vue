<template>
  <el-container class="layout-container">
    <!-- 左侧侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <h2>{{ t('app.title') }}</h2>
      </div>
      
      <el-menu
        :default-active="currentRoute"
        router
        class="sidebar-menu"
        background-color="#001529"
        text-color="rgba(255, 255, 255, 0.65)"
        active-text-color="#fff"
      >
        <el-menu-item index="/tasks/new">
          <span>{{ t('menu.createTask') }}</span>
        </el-menu-item>
        
        <el-menu-item index="/tasks/history">
          <span>{{ t('menu.taskHistory') }}</span>
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
        
        <el-divider style="border-color: rgba(255, 255, 255, 0.1);" />
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
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-main class="main-content">
        <router-view />
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
.layout-container {
  height: 100vh;
  width: 100vw;
}

.sidebar {
  background-color: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.logo {
  padding: 24px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  margin: 0;
  color: #fff;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

:deep(.el-menu-item) {
  height: 52px;
  line-height: 52px;
  font-size: 15px;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
}

.sidebar-footer {
  padding: 0 20px 24px;
}

.language-switcher {
  padding: 16px 0 12px;
}

.language-switcher :deep(.el-select) {
  width: 100%;
}

.language-switcher :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.language-switcher :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.85);
}

.config-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 6px 0;
}

.info-label {
  opacity: 0.6;
}

.info-value {
  font-weight: 500;
}

.server-url {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

.main-content {
  background-color: #f0f2f5;
  padding: 30px;
  overflow-y: auto;
  height: 100vh;
}
</style>
