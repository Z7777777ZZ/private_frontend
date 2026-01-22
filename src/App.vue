<template>
  <el-container class="layout-container">
    <!-- 左侧侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <h2>Agent 评测系统</h2>
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
          <span>创建任务</span>
        </el-menu-item>
        
        <el-menu-item index="/tasks/history">
          <span>历史任务</span>
        </el-menu-item>
      </el-menu>
      
      <!-- 底部配置信息 -->
      <div class="sidebar-footer">
        <el-divider style="border-color: rgba(255, 255, 255, 0.1);" />
        <div class="config-info">
          <div class="info-row">
            <span class="info-label">用户</span>
            <span class="info-value">{{ user }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">服务器</span>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from './stores/task'

const route = useRoute()
const taskStore = useTaskStore()

const currentRoute = computed(() => route.path)
const user = computed(() => taskStore.user)
const serverUrl = computed(() => taskStore.serverUrl)
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
