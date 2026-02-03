<template>
  <div class="task-monitor-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h2>任务监控</h2>
        <p class="task-id">{{ taskId }}</p>
      </div>
      <div class="header-actions">
        <el-button type="danger" @click="handleCancel" :disabled="!isRunning">
          取消任务
        </el-button>
        <el-button @click="handleBack">返回列表</el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：实时截图和日志 -->
      <el-col :span="16">
        <!-- 实时截图 -->
        <el-card class="screenshot-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">实时截图</span>
              <span v-if="frameUpdateTime" class="update-time">{{ frameUpdateTime }}</span>
            </div>
          </template>
          
          <div class="screenshot-container">
            <el-image 
              v-if="latestFrame" 
              :src="latestFrame" 
              fit="contain"
              :preview-src-list="[latestFrame]"
            />
            <div v-else class="empty-state">
              <p>等待截图数据...</p>
            </div>
          </div>
        </el-card>

        <!-- 实时日志 -->
        <el-card class="log-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">实时日志</span>
              <el-button size="small" @click="clearLogs">清空日志</el-button>
            </div>
          </template>
          
          <div class="log-container" ref="logContainerRef">
            <div v-if="logs.length === 0" class="log-empty">
              等待日志输出...
            </div>
            <div v-else class="log-content">
              <div v-for="(log, index) in logs" :key="index" class="log-line">
                {{ log }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：状态和结果 -->
      <el-col :span="8">
        <!-- 任务状态 -->
        <el-card class="status-card">
          <template #header>
            <span class="card-title">任务状态</span>
          </template>
          
          <el-descriptions :column="1" border size="default">
            <el-descriptions-item label="当前状态" label-class-name="desc-label">
              <el-tag :type="statusTagType">{{ statusText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间" label-class-name="desc-label">
              {{ startTime }}
            </el-descriptions-item>
            <el-descriptions-item label="运行时长" label-class-name="desc-label">
              <span class="mono-text">{{ duration }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="完成数量" label-class-name="desc-label">
              <el-tag type="info" effect="plain">{{ resultsCount }} 个样本</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 评测结果 -->
        <el-card class="results-card" v-if="results.length > 0">
          <template #header>
            <span class="card-title">评测结果</span>
          </template>
          
          <div class="results-list">
            <div v-for="(result, index) in results" :key="index" class="result-item">
              <div class="result-header">
                <span class="result-id">{{ result.task_id }}</span>
                <el-tag 
                  :type="(result.attack_success === 'success' || result.attack_success === true) ? 'danger' : 'success'" 
                  size="small"
                >
                  {{ (result.attack_success === 'success' || result.attack_success === true) ? '攻击成功' : '正常' }}
                </el-tag>
              </div>
              <div class="result-scores" v-if="result.scores">
                <div v-for="score in result.scores" :key="score.name" class="score-item">
                  <span class="score-label">{{ score.name }}:</span>
                  <span class="score-value">{{ score.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import { WebSocketManager } from '@/utils/websocket'
import type { TaskStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

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

let durationTimer: number | null = null
let wsManager: WebSocketManager | null = null

// ==================== 计算属性 ====================

const isRunning = computed(() => status.value === 'running' || status.value === 'connecting')
const resultsCount = computed(() => results.value.length)

const statusText = computed(() => {
  const map: Record<string, string> = {
    pending: '等待中',
    connecting: '连接中',
    running: '运行中',
    finished: '已完成',
    error: '错误',
    cancelled: '已取消'
  }
  return map[status.value] || '未知'
})

const statusTagType = computed(() => {
  const map: Record<string, any> = {
    pending: 'info',
    connecting: 'info',
    running: 'warning',
    finished: 'success',
    error: 'danger',
    cancelled: 'info'
  }
  return map[status.value] || 'info'
})

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
  logs.value.push(`[${timestamp}] ${logMsg}`)
  scrollLogToBottom()
}

// ==================== WebSocket 连接 ====================

/**
 * 连接 WebSocket
 */
const connectWebSocket = () => {
  const wsUrl = `${taskStore.wsBaseUrl}/${taskId.value}`
  console.log('[TaskMonitor] 连接 WebSocket:', wsUrl)
  
  addLog('正在连接到任务服务器...')
  
  wsManager = new WebSocketManager(wsUrl)
  
  // 连接成功
  wsManager.on('connected', () => {
    console.log('[TaskMonitor] WebSocket 连接成功')
    status.value = 'running'
    addLog('✓ 已连接到任务服务器')
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
    addLog(`✓ 收到评测结果: ${result.task_id || 'task'}`)
  })
  
  // 任务完成
  wsManager.on('complete', (data: any) => {
    console.log('[TaskMonitor] 任务完成:', data)
    status.value = 'finished'
    taskStore.updateTaskStatus(taskId.value, 'finished')
    addLog('✓ 任务执行完成')
    ElMessage.success(data.message || '任务已完成')
  })
  
  // 连接错误
  wsManager.on('error', (error: any) => {
    console.error('[TaskMonitor] WebSocket 错误:', error)
    addLog('✗ 连接出现错误')
  })
  
  // 连接断开
  wsManager.on('disconnected', () => {
    console.log('[TaskMonitor] WebSocket 断开连接')
    if (status.value === 'running') {
      addLog('⚠ 连接已断开，正在尝试重连...')
    }
  })
  
  // 开始连接
  wsManager.connect().catch((error) => {
    console.error('[TaskMonitor] WebSocket 连接失败:', error)
    status.value = 'error'
    taskStore.updateTaskStatus(taskId.value, 'error')
    addLog('✗ 连接失败，请检查网络或服务器状态')
    ElMessage.error('连接失败，无法监控任务')
  })
}

// ==================== 用户操作 ====================

/**
 * 取消任务
 */
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消当前任务吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    addLog('正在取消任务...')
    
    // 调用 API 取消任务
    await taskStore.cancelTask(taskId.value)
    
    status.value = 'cancelled'
    addLog('✓ 任务已取消')
    ElMessage.success('任务已取消')
    
  } catch (error: any) {
    if (error !== 'cancel') { // 不是用户点击取消
      console.error('[TaskMonitor] 取消任务失败:', error)
      addLog('✗ 取消任务失败')
      ElMessage.error(error.message || '取消任务失败')
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
  ElMessage.info('日志已清空')
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.page-header h2 {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 500;
  color: #303133;
}

.task-id {
  margin: 0;
  color: #909399;
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.update-time {
  font-size: 12px;
  color: #67c23a;
  font-family: 'Consolas', monospace;
}

.screenshot-card {
  margin-bottom: 20px;
}

:deep(.screenshot-card .el-card__body) {
  padding: 0;
}

.screenshot-container {
  height: 480px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.log-card {
}

:deep(.log-card .el-card__body) {
  padding: 0;
}

.log-container {
  height: 320px;
  overflow-y: auto;
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.log-empty {
  color: #888;
  text-align: center;
  padding-top: 60px;
}

.log-line {
  margin-bottom: 3px;
}

.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: #2e2e2e;
}

.log-container::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.status-card {
  margin-bottom: 20px;
}

:deep(.desc-label) {
  font-weight: 500;
}

.mono-text {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.results-card {
  max-height: 520px;
  overflow-y: auto;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 14px;
  background: #fafafa;
  transition: all 0.3s;
}

.result-item:hover {
  background: #f5f7fa;
  border-color: #d0d4d9;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.result-id {
  font-size: 13px;
  font-weight: 500;
  font-family: 'Consolas', monospace;
}

.result-scores {
  font-size: 13px;
  color: #606266;
}

.score-item {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  padding: 4px 0;
  border-bottom: 1px dashed #e4e7ed;
}

.score-item:last-child {
  border-bottom: none;
}

.score-label {
  color: #909399;
}

.score-value {
  font-weight: 500;
  color: #303133;
}
</style>
