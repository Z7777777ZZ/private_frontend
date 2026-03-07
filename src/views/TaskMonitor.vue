<template>
  <div class="task-monitor-page">
    <!-- 页面标题 -->
    <div class="page-header glass-card">
      <div class="header-left">
        <div class="header-text">
          <h2>{{ t('taskMonitor.title') }}</h2>
          <p class="task-id">{{ taskId }}</p>
        </div>
      </div>
      <div class="header-actions">
        <el-button type="danger" @click="handleCancel" :disabled="!isRunning" class="btn-glow">
          {{ t('taskMonitor.cancelTask') }}
        </el-button>
        <el-button @click="handleBack" class="btn-light-flow">
          {{ t('taskMonitor.backToList') }}
        </el-button>
      </div>
    </div>

    <el-row :gutter="16" class="monitor-row">
      <!-- Left Column: Screenshot + Status stacked -->
      <el-col :span="13" class="left-column">
        <!-- Screenshot Card -->
        <div class="screenshot-card glass-card monitor-card">
          <div class="card-header">
            <span class="card-title">{{ t('taskMonitor.screenshot') }}</span>
            <div v-if="frameUpdateTime" class="update-time">
              <span class="pulse-dot"></span>
              {{ frameUpdateTime }}
            </div>
          </div>

          <div class="screenshot-container">
            <img
              v-if="latestFrame"
              :src="latestFrame"
              class="live-frame"
              @click="showImageViewer = true"
            />
            <div v-else class="empty-state">
              <p>{{ t('taskMonitor.waitingScreenshot') }}</p>
            </div>
            <!-- Manual Image Viewer for Preview -->
            <el-image-viewer
              v-if="showImageViewer"
              :url-list="[latestFrame]"
              @close="showImageViewer = false"
            />
          </div>
        </div>

        <!-- Status Card (below screenshot) -->
        <div class="status-card glass-card monitor-card">
          <div class="card-header">
            <span class="card-title">{{ t('taskMonitor.status') }}</span>
            <div class="status-indicator" :class="status">
              <span class="status-dot"></span>
            </div>
          </div>

          <div class="status-content">
            <div class="status-row">
              <span class="status-label">{{ t('taskMonitor.currentStatus') }}</span>
              <span class="status-text" :class="getStatusClass(status)">
                {{ statusText }}
              </span>
            </div>
            <div class="status-row">
              <span class="status-label">{{ t('taskMonitor.startTime') }}</span>
              <span class="status-value mono-text">{{ startTime }}</span>
            </div>
            <div class="status-row">
              <span class="status-label">{{ t('taskMonitor.duration') }}</span>
              <span class="status-value mono-text duration-display">{{ duration }}</span>
            </div>
            <div class="status-row">
              <span class="status-label">{{ t('taskMonitor.completedCount') }}</span>
              <span class="status-value">{{ resultsCount }} {{ t('taskMonitor.samples') }}</span>
            </div>

            <div class="status-divider"></div>

            <div v-if="currentConfig?.agent" class="status-row">
              <span class="status-label">{{ t('taskNew.agentSoftware') }}</span>
              <span class="status-value">{{ currentConfig.agent.software }}</span>
            </div>
            <div v-if="currentConfig?.agent?.model" class="status-row">
              <span class="status-label">{{ t('taskNew.llmModel') }}</span>
              <span class="status-value mono-text model-name">{{ currentConfig.agent.model.model_name }}</span>
            </div>
            <div v-if="currentConfig?.dataset_name" class="status-row">
              <span class="status-label">{{ t('taskNew.dataset') }}</span>
              <span class="status-value">{{ currentConfig.dataset_name }}</span>
            </div>
            <div v-if="currentConfig?.attack_method_name" class="status-row">
              <span class="status-label">{{ t('taskNew.attackMethod') }}</span>
              <span class="status-value">{{ currentConfig.attack_method_name }}</span>
            </div>
          </div>
        </div>
      </el-col>

      <!-- Right Column: Full-height Chat/Log Panel -->
      <el-col :span="11" class="right-column">
        <div class="log-panel-card glass-card monitor-card log-panel-full-height">
          <div class="card-header">
            <el-tabs v-model="activeLogTab" class="log-tabs">
              <el-tab-pane :label="t('taskMonitor.chatTab')" name="chat">
                <template #label>
                  <span class="tab-label">{{ t('taskMonitor.chatTab') }}</span>
                </template>
              </el-tab-pane>
              <el-tab-pane :label="t('taskMonitor.rawLogTab')" name="raw">
                <template #label>
                  <span class="tab-label">{{ t('taskMonitor.rawLogTab') }}</span>
                </template>
              </el-tab-pane>
            </el-tabs>
            <el-button size="small" @click="clearLogs" class="btn-light-flow clear-btn">
              {{ t('taskMonitor.clearLogs') }}
            </el-button>
          </div>

          <!-- Chat Tab Content -->
          <div v-show="activeLogTab === 'chat'" class="chat-log-wrapper">
            <div class="chat-log-container" ref="logContainerRef">
              <div v-if="logs.length === 0 && status !== 'connecting'" class="chat-log-empty">
                <p>{{ t('taskMonitor.waitingLogs') }}</p>
              </div>
              <div v-else>
                <!-- Connection Status Message -->
                <div v-if="status === 'connecting'" class="chat-message">
                  <div class="chat-message-avatar system">SYS</div>
                  <div>
                    <div class="chat-bubble system">
                      <div class="chat-message-content">{{ t('taskMonitor.logMessages.connecting') }}</div>
                    </div>
                    <div class="chat-message-time">{{ getCurrentTime() }}</div>
                  </div>
                </div>

                <!-- Log Messages -->
                <div v-for="(log, index) in logs" :key="index" class="chat-message" :class="getLogMessageClass(log)">
                  <div class="chat-message-avatar" :class="getLogMessageClass(log)">{{ getLogAvatarText(log) }}</div>
                  <div>
                    <div class="chat-bubble" :class="getLogMessageClass(log)">
                      <div class="chat-message-content">{{ formatLogMessage(log) }}</div>
                    </div>
                    <div class="chat-message-time">{{ getLogTime(log) }}</div>
                  </div>
                </div>

                <!-- Typing Indicator -->
                <div v-if="isRunning" class="chat-message">
                  <div class="chat-message-avatar agent">AI</div>
                  <div class="chat-typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chat Input Area -->
            <div class="chat-input-area">
              <el-input
                v-model="chatInput"
                type="textarea"
                :rows="2"
                :placeholder="t('taskMonitor.inputPlaceholder')"
                @keyup.ctrl.enter="sendChatMessage"
                class="chat-input"
              />
              <div class="chat-input-actions">
                <span class="input-hint">{{ t('taskMonitor.inputHint') }}</span>
                <el-button type="primary" @click="sendChatMessage" size="small" class="send-btn">
                  {{ t('taskMonitor.send') }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- Raw Log Tab Content -->
          <div v-show="activeLogTab === 'raw'" class="raw-log-container">
            <pre v-if="logs.length > 0" class="raw-log-content">{{ rawLogOutput }}</pre>
            <div v-else class="chat-log-empty">
              <p>{{ t('taskMonitor.waitingLogs') }}</p>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Floating Results Button -->
    <transition name="bounce-in">
      <el-button
        v-if="results.length > 0"
        @click="resultsDrawerVisible = true"
        class="floating-results-btn"
        type="primary"
        circle
        size="large"
      >
        <template #icon>
          <span class="results-icon">{{ results.length }}</span>
        </template>
      </el-button>
    </transition>

    <!-- Results Drawer -->
    <el-drawer
      v-model="resultsDrawerVisible"
      direction="btt"
      :size="results.length > 0 ? '40%' : '30%'"
      class="results-drawer"
    >
      <template #header>
        <div class="drawer-header">
          <span>{{ t('taskMonitor.results') }}</span>
          <span class="results-count">{{ results.length }}</span>
        </div>
      </template>
      <div class="results-content">
        <div v-for="(result, index) in results" :key="index" class="result-item">
          <div class="result-header">
            <span class="result-id mono-text">{{ result.task_id || `#${index + 1}` }}</span>
            <span class="result-status" :class="(result.attack_success === 'success' || result.attack_success === true) ? 'attack-success' : 'normal'">
              {{ (result.attack_success === 'success' || result.attack_success === true) ? t('taskMonitor.attackSuccess') : t('taskMonitor.normal') }}
            </span>
          </div>
          <div class="result-scores" v-if="result.scores">
            <div v-for="score in result.scores" :key="score.name" class="score-item">
              <span class="score-label">{{ score.name }}:</span>
              <span class="score-value">{{ score.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import { WebSocketManager } from '@/utils/websocket'
import type { TaskStatus } from '@/types'

const showImageViewer = ref(false)
const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const { t } = useI18n()

const taskId = ref(route.params.taskId as string)
const status = ref<TaskStatus>('connecting')
const startTime = ref(new Date().toLocaleString())
const startTimestamp = ref(Date.now())
const duration = ref('00:00:00')
const latestFrame = ref<string | null>(null)
const frameUpdateTime = ref('')
const logs = ref<string[]>([])
const results = ref<any[]>([])
const logContainerRef = ref<HTMLElement>()
const activeLogTab = ref('chat')
const resultsDrawerVisible = ref(false)
const chatInput = ref('')

let durationTimer: number | null = null
let wsManager: WebSocketManager | null = null

// ==================== 计算属性 ====================

const isRunning = computed(() => status.value === 'running' || status.value === 'connecting')
const resultsCount = computed(() => results.value.length)

const currentConfig = computed(() => {
  if (taskStore.currentTask?.taskId === taskId.value) {
    return taskStore.currentTask.config as any
  }
  const historyTask = taskStore.taskHistory.find(t => t.taskId === taskId.value)
  return historyTask?.config as any
})

const statusText = computed(() => {
  return t(`taskMonitor.statusMap.${status.value}` as any) || t('taskMonitor.statusMap.unknown')
})

const rawLogOutput = computed(() => {
  return logs.value.map((log: any) => {
    const logMsg = typeof log === 'string' ? log : (log.message || JSON.stringify(log))
    const timestamp = typeof log === 'string' ? '' : (log.timestamp || new Date().toLocaleTimeString())
    return timestamp ? `[${timestamp}] ${logMsg}` : logMsg
  }).join('\n')
})

const getStatusClass = (statusValue: string) => {
  const map: Record<string, string> = {
    running: 'running',
    finished: 'finished',
    error: 'error',
    cancelled: 'cancelled',
    connecting: 'connecting'
  }
  return map[statusValue] || 'unknown'
}

// ==================== 工具函数 ====================

/**
 * 更新运行时长
 */
const updateDuration = () => {
  const elapsed = Date.now() - startTimestamp.value
  const seconds = Math.floor(elapsed / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  duration.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 滚动日志到底部
 */
const scrollLogToBottom = () => {
  nextTick(() => {
    if (logContainerRef.value) {
      logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight
    }
  })
}

/**
 * 添加日志
 */
const addLog = (log: string | any) => {
  const timestamp = new Date().toLocaleTimeString()
  const logMsg = typeof log === 'string' ? log : JSON.stringify(log)
  logs.value.push({
    message: logMsg,
    timestamp: timestamp,
    type: determineLogType(logMsg)
  })
  scrollLogToBottom()
}

/**
 * 获取当前时间
 */
const getCurrentTime = () => {
  return new Date().toLocaleTimeString()
}

/**
 * 确定日志类型
 */
const determineLogType = (log: string): string => {
  const lowerLog = log.toLowerCase()
  if (lowerLog.includes('error') || lowerLog.includes('failed') || lowerLog.includes('exception')) {
    return 'error'
  } else if (lowerLog.includes('warning') || lowerLog.includes('warn')) {
    return 'warning'
  } else if (lowerLog.includes('success') || lowerLog.includes('completed') || lowerLog.includes('finished')) {
    return 'success'
  } else if (lowerLog.includes('agent') || lowerLog.includes('executing') || lowerLog.includes('running')) {
    return 'agent'
  }
  return 'system'
}

/**
 * 获取日志消息的CSS类
 */
const getLogMessageClass = (log: any) => {
  if (typeof log === 'string') {
    return determineLogType(log)
  }
  return log.type || 'system'
}

/**
 * 获取日志头像文本
 */
const getLogAvatarText = (log: any) => {
  const type = typeof log === 'string' ? determineLogType(log) : (log.type || 'system')
  const labels: Record<string, string> = {
    system: 'SYS',
    agent: 'AI',
    success: 'OK',
    warning: 'WARN',
    error: 'ERR',
    user: 'YOU'
  }
  return labels[type] || 'SYS'
}

/**
 * 格式化日志消息
 */
const formatLogMessage = (log: any) => {
  if (typeof log === 'string') {
    return log
  }
  return log.message || JSON.stringify(log)
}

/**
 * 获取日志时间
 */
const getLogTime = (log: any) => {
  if (typeof log === 'string') {
    return ''
  }
  return log.timestamp || ''
}

// ==================== WebSocket 连接 ====================

/**
 * 连接 WebSocket
 */
const connectWebSocket = () => {
  const wsUrl = `${taskStore.wsBaseUrl}/${taskId.value}`
  console.log('[TaskMonitor] 连接 WebSocket:', wsUrl)

  addLog(t('taskMonitor.logMessages.connecting'))

  wsManager = new WebSocketManager(wsUrl)

  // 连接成功
  wsManager.on('connected', () => {
    console.log('[TaskMonitor] WebSocket 连接成功')
    status.value = 'running'
    addLog(t('taskMonitor.logMessages.connected'))
  })

  // 接收截图
  wsManager.on('frame', (frame: string) => {
    console.log('[TaskMonitor] 收到截图')
    latestFrame.value = frame
    frameUpdateTime.value = new Date().toLocaleTimeString()
  })

  // 接收日志
  wsManager.on('log', (log: string | any) => {
    console.log('[TaskMonitor] 收到日志:', log)
    const logMsg = typeof log === 'string' ? log : (log.message || JSON.stringify(log))
    addLog(logMsg)
  })

  // 接收结果
  wsManager.on('result', (result: any) => {
    console.log('[TaskMonitor] 收到结果:', result)
    results.value.push(result)
    addLog(`${t('taskMonitor.logMessages.receivedResult')}: ${result.task_id || 'task'}`)
  })

  // 任务完成
  wsManager.on('complete', (data: any) => {
    console.log('[TaskMonitor] 任务完成:', data)
    status.value = 'finished'
    taskStore.updateTaskStatus(taskId.value, 'finished')
    addLog(t('taskMonitor.logMessages.taskComplete'))
    ElMessage.success(data.message || t('taskMonitor.messages.taskComplete'))
  })

  // 连接错误
  wsManager.on('error', (error: any) => {
    console.error('[TaskMonitor] WebSocket 错误:', error)
    addLog(t('taskMonitor.logMessages.error'))
  })

  // 连接断开
  wsManager.on('disconnected', () => {
    console.log('[TaskMonitor] WebSocket 断开连接')
    if (status.value === 'running') {
      addLog(t('taskMonitor.logMessages.disconnected'))
    }
  })

  // 开始连接
  wsManager.connect().catch((error) => {
    console.error('[TaskMonitor] WebSocket 连接失败:', error)
    status.value = 'error'
    taskStore.updateTaskStatus(taskId.value, 'error')
    addLog(t('taskMonitor.logMessages.failed'))
    ElMessage.error(t('taskMonitor.messages.connectFailed'))
  })
}

// ==================== 用户操作 ====================

/**
 * 取消任务
 */
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(t('taskMonitor.confirmCancel'), t('taskMonitor.confirm'), {
      confirmButtonText: t('taskMonitor.confirm'),
      cancelButtonText: t('taskMonitor.cancel'),
      type: 'warning'
    })

    addLog(t('taskMonitor.logMessages.taskCanceling'))

    // 调用 API 取消任务
    await taskStore.cancelTask(taskId.value)

    status.value = 'cancelled'
    addLog(t('taskMonitor.logMessages.taskCanceled'))
    ElMessage.success(t('taskMonitor.messages.taskCancelSuccess'))

  } catch (error: any) {
    if (error !== 'cancel') { // 不是用户点击取消
      console.error('[TaskMonitor] 取消任务失败:', error)
      addLog(t('taskMonitor.logMessages.cancelFailed'))
      ElMessage.error(error.message || t('taskMonitor.cancelFailed'))
    }
  }
}

/**
 * 返回历史列表
 */
const handleBack = () => {
  router.push('/tasks/history')
}

/**
 * 清空日志
 */
const clearLogs = () => {
  logs.value = []
  ElMessage.info(t('taskMonitor.logCleared'))
}

/**
 * 发送聊天消息（本地显示）
 */
const sendChatMessage = () => {
  if (!chatInput.value.trim()) return

  // 添加用户消息到日志（本地显示）
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({
    message: chatInput.value,
    timestamp: timestamp,
    type: 'user'
  })

  chatInput.value = ''
  scrollLogToBottom()
}

// ==================== 生命周期 ====================

onMounted(() => {
  console.log('[TaskMonitor] 页面加载，任务ID:', taskId.value)

  // 启动时长计时器
  durationTimer = window.setInterval(updateDuration, 1000)

  // 连接 WebSocket
  connectWebSocket()
})

onUnmounted(() => {
  console.log('[TaskMonitor] 页面卸载，清理资源')

  // 清除计时器
  if (durationTimer !== null) {
    clearInterval(durationTimer)
    durationTimer = null
  }

  // 关闭 WebSocket 连接
  if (wsManager) {
    wsManager.close()
    wsManager = null
  }
})
</script>

<style scoped>
.task-monitor-page {
  height: 100%;
}

/* ============================================
   PAGE HEADER
   ============================================ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding: var(--space-lg);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-text h2 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-id {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

/* ============================================
   MONITOR ROW - equal-height columns
   ============================================ */
:deep(.monitor-row.el-row) {
  align-items: stretch;
}

/* Disable glass-card hover lift on monitor cards to prevent overlap */
.monitor-card:hover {
  transform: none !important;
}

/* ============================================
   LEFT COLUMN (Screenshot + Status stacked)
   ============================================ */
.left-column {
  display: flex;
  flex-direction: column;
}

.left-column .screenshot-card {
  flex-shrink: 0;
  margin-bottom: var(--space-md);
}

.left-column .status-card {
  flex-shrink: 0;
  margin-bottom: 0;
}

/* ============================================
   RIGHT COLUMN (full-height log panel)
   ============================================ */
.right-column {
  display: flex;
  flex-direction: column;
}

/* ============================================
   SCREENSHOT CARD
   ============================================ */
.screenshot-card {
  margin-bottom: var(--space-md);
}

.screenshot-container {
  min-height: 200px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  /* 16:9 aspect ratio container */
  aspect-ratio: 16 / 9;
}

.screenshot-card .live-frame {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  cursor: zoom-in;
  transition: transform var(--duration-normal) var(--ease-out-cubic);
}

.screenshot-card .live-frame:hover {
  transform: scale(1.02);
}

.screenshot-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--glass-border);
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.update-time {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 12px;
  color: var(--color-accent-green);
  font-family: 'Consolas', monospace;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: var(--color-accent-green);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: var(--space-2xl);
}

/* ============================================
   STATUS CARD
   ============================================ */
.status-card {
  margin-bottom: 0;
}

.status-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--glass-border);
}

.status-indicator {
  display: flex;
  align-items: center;
}

.status-indicator .status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse-glow 2s ease-in-out infinite;
}

.status-indicator.running .status-dot {
  background: var(--color-accent-orange);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

.status-indicator.finished .status-dot {
  background: var(--color-accent-green);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  animation: none;
}

.status-indicator.error .status-dot {
  background: var(--color-accent-red);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
  animation: none;
}

.status-indicator.connecting .status-dot {
  background: var(--color-accent-cyan);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
  animation: pulse 1s ease-in-out infinite;
}

.status-content {
  padding: var(--space-md) var(--space-lg);
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.status-row:last-child {
  border-bottom: none;
}

.status-label {
  color: var(--text-tertiary);
  font-size: 13px;
}

.status-value {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  text-align: right;
}

.status-text {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-text.running {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-accent-orange);
}

.status-text.finished {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-accent-green);
}

.status-text.error {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-accent-red);
}

.status-text.connecting {
  background: rgba(6, 182, 212, 0.15);
  color: var(--color-accent-cyan);
}

.status-text.cancelled {
  background: rgba(107, 114, 128, 0.15);
  color: var(--text-secondary);
}

.duration-display {
  color: var(--color-accent-cyan);
  font-size: 14px;
}

.model-name {
  word-break: break-all;
}

.status-divider {
  height: 1px;
  background: var(--glass-border);
  margin: var(--space-md) 0;
}

/* ============================================
   LOG PANEL CARD WITH TABS
   ============================================ */
.log-panel-card {
  margin-bottom: 0;
}

/* Full-height log panel - flex: 1 fills the right column completely */
.log-panel-card.log-panel-full-height {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0; /* critical: allows flex child to shrink below content size */
}

.log-panel-card.log-panel-full-height .card-header {
  flex-shrink: 0;
}

.log-panel-card.log-panel-full-height .chat-log-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.log-panel-card.log-panel-full-height .chat-log-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.log-panel-card.log-panel-full-height .raw-log-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.log-panel-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  background: rgba(139, 92, 246, 0.1);
  border-bottom: 1px solid var(--glass-border);
}

.log-tabs {
  flex: 1;
}

.log-tabs :deep(.el-tabs__header) {
  margin: 0;
  background: transparent;
}

.log-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.log-tabs :deep(.el-tabs__item) {
  color: var(--text-tertiary);
  padding: 0 var(--space-md);
  height: 48px;
  line-height: 48px;
}

.log-tabs :deep(.el-tabs__item.is-active) {
  color: var(--color-accent-purple);
}

.log-tabs :deep(.el-tabs__active-bar) {
  background: var(--gradient-primary);
}

.tab-label {
  font-size: 14px;
}

.clear-btn {
  margin-left: var(--space-md);
}

/* Chat Log Wrapper (contains chat log + input) */
.chat-log-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Chat Log Container */
.chat-log-container {
  overflow-y: auto;
  padding: var(--space-md);
  background: rgba(15, 15, 35, 0.3);
}

.chat-log-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  color: var(--text-muted);
  text-align: center;
}

.chat-log-empty p {
  margin: 0;
}

/* Raw Log Container */
.raw-log-container {
  overflow-y: auto;
  padding: var(--space-md);
  background: rgba(0, 0, 0, 0.3);
}

.raw-log-content {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-code-dim);
}

/* ============================================
   CHAT MESSAGE STYLES
   ============================================ */
.chat-message {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
  animation: message-enter 0.4s var(--ease-spring) forwards;
}

.chat-message-avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  text-transform: uppercase;
}

.chat-message-avatar.system {
  background: var(--msg-system-bg);
  border: 1px solid var(--msg-system-border);
  color: var(--msg-system-text);
}

.chat-message-avatar.agent {
  background: var(--msg-agent-bg);
  border: 1px solid var(--msg-agent-border);
  color: var(--msg-agent-text);
}

.chat-message-avatar.success {
  background: var(--msg-success-bg);
  border: 1px solid var(--msg-success-border);
  color: var(--msg-success-text);
}

.chat-message-avatar.warning {
  background: var(--msg-warning-bg);
  border: 1px solid var(--msg-warning-border);
  color: var(--msg-warning-text);
}

.chat-message-avatar.error {
  background: var(--msg-error-bg);
  border: 1px solid var(--msg-error-border);
  color: var(--msg-error-text);
}

.chat-message-avatar.user {
  background: var(--gradient-primary);
  border: 1px solid rgba(139, 92, 246, 0.5);
  color: #fff;
}

.chat-bubble {
  padding: 10px 14px;
  border-radius: 14px;
  backdrop-filter: blur(12px);
  max-width: calc(100% - 45px);
}

.chat-bubble.system {
  background: var(--msg-system-bg);
  border: 1px solid var(--msg-system-border);
  color: var(--msg-system-text);
  border-bottom-left-radius: 4px;
}

.chat-bubble.agent {
  background: var(--msg-agent-bg);
  border: 1px solid var(--msg-agent-border);
  color: var(--msg-agent-text);
  border-bottom-left-radius: 4px;
}

.chat-bubble.success {
  background: var(--msg-success-bg);
  border: 1px solid var(--msg-success-border);
  color: var(--msg-success-text);
  border-bottom-left-radius: 4px;
}

.chat-bubble.warning {
  background: var(--msg-warning-bg);
  border: 1px solid var(--msg-warning-border);
  color: var(--msg-warning-text);
  border-bottom-left-radius: 4px;
}

.chat-bubble.error {
  background: var(--msg-error-bg);
  border: 1px solid var(--msg-error-border);
  color: var(--msg-error-text);
  border-bottom-left-radius: 4px;
}

.chat-bubble.user {
  background: var(--gradient-primary);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #fff;
  border-bottom-left-radius: 4px;
}

.chat-message-content {
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.chat-message-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  padding-left: 4px;
}

/* Typing Indicator */
.chat-typing-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--msg-agent-bg);
  border: 1px solid var(--msg-agent-border);
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  width: fit-content;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--color-accent-cyan);
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* ============================================
   CHAT INPUT AREA
   ============================================ */
.chat-input-area {
  flex-shrink: 0;
  padding: var(--space-md);
  background: rgba(15, 15, 35, 0.5);
  border-top: 1px solid var(--glass-border);
}

.chat-input-area .chat-input :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  resize: none;
  font-size: 13px;
  line-height: 1.5;
}

.chat-input-area .chat-input :deep(.el-textarea__inner):focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.5);
  outline: none;
}

.chat-input-area .chat-input :deep(.el-textarea__inner)::placeholder {
  color: var(--text-muted);
}

.chat-input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-sm);
}

.input-hint {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}

.send-btn {
  background: var(--gradient-primary);
  border: none;
  padding: 6px 16px;
}

.send-btn:hover {
  opacity: 0.9;
}

/* ============================================
   FLOATING RESULTS BUTTON
   ============================================ */
.floating-results-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  background: var(--gradient-primary);
  border: none;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
}

.floating-results-btn:hover {
  box-shadow: 0 6px 30px rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.results-icon {
  font-size: 14px;
}

.bounce-in-enter-active {
  animation: bounce-in 0.3s ease-out;
}

.bounce-in-leave-active {
  animation: bounce-in 0.3s ease-out reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ============================================
   RESULTS DRAWER
   ============================================ */
:deep(.results-drawer .el-drawer__body) {
  background: var(--glass-bg-heavy);
  backdrop-filter: blur(var(--blur-xl));
  padding: var(--space-md);
}

:deep(.results-drawer .el-drawer__header) {
  background: rgba(139, 92, 246, 0.1);
  border-bottom: 1px solid var(--glass-border);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: 0;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.results-count {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: var(--radius-full);
  font-size: 14px;
  color: var(--color-accent-purple);
}

.results-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.result-item {
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  transition: all var(--duration-normal) var(--ease-out-cubic);
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.3);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.result-id {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-accent-cyan-light);
}

.result-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.result-status.attack-success {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-accent-red);
}

.result-status.normal {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-accent-green);
}

.result-scores {
  font-size: 12px;
  color: var(--text-tertiary);
}

.score-item {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  padding: 4px 0;
  border-bottom: 1px dashed var(--glass-border);
}

.score-item:last-child {
  border-bottom: none;
}

.score-label {
  color: var(--text-muted);
}

.score-value {
  font-weight: 500;
  color: var(--text-secondary);
}

.mono-text {
  font-family: 'Consolas', 'Monaco', monospace;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1200px) {
  :deep(.monitor-row.el-row) {
    align-items: flex-start;
  }

  .task-monitor-page :deep(.el-col-13) {
    width: 100%;
  }

  .task-monitor-page :deep(.el-col-11) {
    width: 100%;
    margin-top: var(--space-md);
  }

  .right-column {
    min-height: 500px;
  }

  .left-column .status-card {
    margin-bottom: var(--space-md);
  }
}
</style>
