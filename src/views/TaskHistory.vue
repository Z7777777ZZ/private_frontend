<template>
  <div class="task-history-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h2>{{ t('taskHistory.title') }}</h2>
        <p>{{ t('taskHistory.subtitle') }}</p>
      </div>
      <el-button type="primary" @click="handleNewTask" size="large">
        {{ t('taskHistory.createNewTask') }}
      </el-button>
    </div>

    <!-- 任务列表 -->
    <el-card>
      <el-table 
        :data="paginatedTasks" 
        stripe 
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="index" :label="t('taskHistory.index')" width="60" />
        
        <el-table-column prop="taskId" :label="t('taskHistory.taskId')" min-width="220">
          <template #default="{ row }">
            <span class="task-id">{{ row.taskId }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="startTime" :label="t('taskHistory.createTime')" width="180" />
        
        <el-table-column prop="status" :label="t('taskHistory.status')" width="100">
          <template #default="{ row }">
            <span class="status-text" :class="getStatusClass(row.status)">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="config.agent.software" :label="t('taskHistory.software')" width="140">
          <template #default="{ row }">
            <span v-if="row.config?.agent" class="table-text">{{ row.config.agent.software }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="config.agent.model.model_name" :label="t('taskHistory.model')" width="180">
          <template #default="{ row }">
            <span v-if="row.config?.agent?.model" class="model-text">
              {{ row.config.agent.model.model_name }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="config.dataset_name" :label="t('taskHistory.dataset')" width="160">
          <template #default="{ row }">
            <span v-if="row.config" class="table-text">{{ row.config.dataset_name }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        
        <el-table-column :label="t('taskHistory.actions')" width="260" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="handleView(row)">
                {{ t('taskHistory.viewDetail') }}
              </el-button>
              <el-button size="small" type="primary" @click="handleRetry(row)">
                {{ t('taskHistory.retry') }}
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                {{ t('taskHistory.delete') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalTasks"
          background
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      :title="t('taskHistory.taskDetail')" 
      width="900px"
    >
      <el-descriptions :column="2" border v-if="selectedTask">
        <el-descriptions-item :label="t('taskHistory.taskId')" :span="2">
          <span class="task-id">{{ selectedTask.taskId }}</span>
        </el-descriptions-item>
        
        <el-descriptions-item :label="t('taskHistory.taskStatus')">
          <span class="status-text" :class="getStatusClass(selectedTask.status)">
            {{ getStatusText(selectedTask.status) }}
          </span>
        </el-descriptions-item>
        
        <el-descriptions-item :label="t('taskHistory.createTime')">
          {{ selectedTask.startTime }}
        </el-descriptions-item>
        
        <el-descriptions-item :label="t('taskHistory.agentSoftware')" v-if="selectedTask.config?.agent">
          {{ selectedTask.config.agent.software }}
        </el-descriptions-item>
        
        <el-descriptions-item :label="t('taskHistory.llmModel')" v-if="selectedTask.config?.agent?.model">
          {{ selectedTask.config.agent.model.model_name }}
        </el-descriptions-item>
        
        <el-descriptions-item :label="t('taskHistory.dataset')" v-if="selectedTask.config">
          {{ selectedTask.config.dataset_name }}
        </el-descriptions-item>
        
        <el-descriptions-item :label="t('taskHistory.attackMethod')" v-if="selectedTask.config">
          {{ selectedTask.config.attack_method_name || t('taskHistory.noAttack') }}
        </el-descriptions-item>
        
        <el-descriptions-item :label="t('taskHistory.fullConfig')" :span="2" v-if="selectedTask.config">
          <el-input 
            type="textarea" 
            :value="JSON.stringify(selectedTask.config, null, 2)" 
            :rows="12" 
            readonly
            class="config-json"
          />
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false" size="large">{{ t('taskHistory.close') }}</el-button>
        <el-button type="success" @click="handleViewReport(selectedTask)" size="large">
          {{ t('taskHistory.viewFullReport') }}
        </el-button>
        <el-button 
          v-if="selectedTask && selectedTask.status === 'running'" 
          type="primary" 
          @click="handleMonitor(selectedTask)" 
          size="large"
        >
          {{ t('taskHistory.viewMonitor') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 完整报告对话框 -->
    <el-dialog 
      v-model="reportDialogVisible" 
      :title="t('taskHistory.fullReport')" 
      width="1200px"
      :close-on-click-modal="false"
    >
      <div v-loading="reportLoading">
        <el-alert 
          v-if="reportError" 
          type="error" 
          :title="reportError" 
          :closable="false"
          style="margin-bottom: 16px;"
        />
        
        <el-tabs v-if="fullReport" type="border-card">
          <el-tab-pane :label="t('taskHistory.basicInfo')">
            <el-descriptions :column="2" border>
              <el-descriptions-item :label="t('taskHistory.sampleId')">{{ fullReport.sample_id }}</el-descriptions-item>
              <el-descriptions-item :label="t('taskHistory.status')">
                <span class="status-text" :class="getStatusClass(fullReport.status || 'unknown')">
                  {{ fullReport.status }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item :label="t('taskHistory.attackResult')" :span="2">
                <span class="status-text" :class="(fullReport.result?.attack_success === 'success' || fullReport.result?.attack_success === true) ? 'error' : 'finished'">
                  {{ (fullReport.result?.attack_success === 'success' || fullReport.result?.attack_success === true) ? t('taskHistory.attackSuccess') : t('taskHistory.attackFailed') }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item :label="t('taskHistory.startTime')" v-if="fullReport.stats">
                {{ new Date(fullReport.stats.started_at * 1000).toLocaleString() }}
              </el-descriptions-item>
              <el-descriptions-item :label="t('taskHistory.completeTime')" v-if="fullReport.stats">
                {{ new Date(fullReport.stats.completed_at * 1000).toLocaleString() }}
              </el-descriptions-item>
              <el-descriptions-item :label="t('taskHistory.duration')" v-if="fullReport.stats">
                {{ Math.round(fullReport.stats.duration) }} {{ t('taskHistory.seconds') }}
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane :label="t('taskHistory.scoreDetails')" v-if="fullReport.result?.scores">
            <el-descriptions :column="1" border>
              <el-descriptions-item v-for="(scoreList, dataset) in fullReport.result.scores" :key="dataset" :label="String(dataset)" :span="2">
                <div v-if="Array.isArray(scoreList)">
                  <div v-for="(score, idx) in scoreList" :key="idx" style="margin-bottom: 12px;">
                    <strong>{{ score.name }}:</strong> {{ score.value }}
                    <div v-if="score.explanation" style="margin-top: 4px; color: #606266; font-size: 13px;">
                      {{ score.explanation }}
                    </div>
                  </div>
                </div>
                <div v-else>{{ scoreList }}</div>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane :label="t('taskHistory.conversationHistory')" v-if="fullReport.result?.trace">
            <div class="trace-container">
              <div v-for="(msg, idx) in fullReport.result.trace" :key="idx" class="trace-message">
                <div class="trace-header">
                  <span class="role-badge" :class="msg.role === 'user' ? 'role-user' : 'role-ai'">
                    {{ msg.role === 'user' ? t('taskHistory.user') : t('taskHistory.ai') }}
                  </span>
                  <span class="trace-index">#{{ idx + 1 }}</span>
                </div>
                <pre class="trace-content">{{ msg.content }}</pre>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane :label="t('taskHistory.executedCommands')" v-if="fullReport.result?.commands_executed">
            <div class="commands-container">
              <div v-for="(cmd, idx) in fullReport.result.commands_executed" :key="idx" class="command-item">
                <div class="command-index">#{{ idx + 1 }}</div>
                <pre class="command-content">{{ cmd }}</pre>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane :label="t('taskHistory.sampleInfo')" v-if="fullReport.sample">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="ID">{{ fullReport.sample.id }}</el-descriptions-item>
              <el-descriptions-item :label="t('taskHistory.input')">
                <pre style="white-space: pre-wrap;">{{ fullReport.sample.user_instruction || fullReport.sample.input }}</pre>
              </el-descriptions-item>
              <el-descriptions-item :label="t('taskHistory.metadata')" v-if="fullReport.sample.metadata">
                <el-input 
                  type="textarea" 
                  :value="JSON.stringify(fullReport.sample.metadata, null, 2)" 
                  :rows="10" 
                  readonly
                />
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane :label="t('taskHistory.fullJson')">
            <el-input 
              type="textarea" 
              :value="JSON.stringify(fullReport, null, 2)" 
              :rows="20" 
              readonly
              class="json-viewer"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <template #footer>
        <el-button @click="reportDialogVisible = false" size="large">{{ t('taskHistory.close') }}</el-button>
        <el-button type="primary" @click="downloadReport" size="large" :disabled="!fullReport">
          {{ t('taskHistory.downloadReport') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskStore } from '@/stores/task'

const router = useRouter()
const taskStore = useTaskStore()
const { t } = useI18n()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const detailDialogVisible = ref(false)
const selectedTask = ref<any>(null)
const reportDialogVisible = ref(false)
const reportLoading = ref(false)
const reportError = ref('')
const fullReport = ref<any>(null)

// 使用 Store 中的真实历史数据
const totalTasks = computed(() => taskStore.taskHistory.length)

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return taskStore.taskHistory.slice(start, end)
})

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    running: 'warning',
    finished: 'success',
    error: 'danger',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    running: 'running',
    finished: 'finished',
    error: 'error',
    cancelled: 'cancelled'
  }
  return map[status] || 'unknown'
}

const getStatusText = (status: string) => {
  return t(`taskHistory.statusMap.${status}` as any) || t('taskHistory.statusMap.unknown')
}

const handleNewTask = () => {
  router.push('/tasks/new')
}

const handleView = (task: any) => {
  selectedTask.value = task
  detailDialogVisible.value = true
}

const handleMonitor = (task: any) => {
  router.push(`/tasks/monitor/${task.taskId}`)
}

const handleViewReport = async (task: any) => {
  reportDialogVisible.value = true
  reportLoading.value = true
  reportError.value = ''
  fullReport.value = null
  
  try {
    const report = await taskStore.fetchReport(task.taskId)
    fullReport.value = report
  } catch (error: any) {
    console.error('[TaskHistory] 获取报告失败:', error)
    reportError.value = error.message || t('taskHistory.messages.reportFetchFailed')
    ElMessage.error(reportError.value)
  } finally {
    reportLoading.value = false
  }
}

const downloadReport = () => {
  if (!fullReport.value) return
  
  const dataStr = JSON.stringify(fullReport.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `report_${fullReport.value.sample_id || 'unknown'}_${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success(t('taskHistory.messages.reportDownloaded'))
}

const handleRetry = async (task: any) => {
  try {
    await ElMessageBox.confirm(t('taskHistory.confirmRetry'), t('taskHistory.confirm'), {
      confirmButtonText: t('taskHistory.confirm'),
      cancelButtonText: t('taskHistory.cancel'),
      type: 'info'
    })
    
    // 判断任务类型并启动
    if (!task.config) {
      ElMessage.error(t('taskHistory.messages.noConfig'))
      return
    }
    
    loading.value = true
    
    try {
      let result
      // 根据配置判断是数据集任务还是单样本任务
      if (task.config.dataset_name) {
        // 数据集任务
        result = await taskStore.startDatasetTask(task.config)
      } else if (task.config.sample) {
        // 单样本任务（ExperimentConfig 结构）
        result = await taskStore.startSingleSampleTask(task.config)
      } else {
        ElMessage.error(t('taskHistory.messages.unknownTaskType'))
        return
      }
      
      ElMessage.success(t('taskHistory.messages.taskStarted'))
      // 跳转到监控页面
      router.push(`/tasks/monitor/${result.task_id}`)
    } catch (error: any) {
      console.error('[TaskHistory] 重新运行任务失败:', error)
      ElMessage.error(error.message || t('taskHistory.messages.startFailed'))
    } finally {
      loading.value = false
    }
  } catch {
    // 用户取消操作
  }
}

const handleDelete = (task: any) => {
  ElMessageBox.confirm(t('taskHistory.confirmDelete'), t('taskHistory.warning'), {
    confirmButtonText: t('taskHistory.confirmDeleteBtn'),
    cancelButtonText: t('taskHistory.cancel'),
    type: 'warning'
  }).then(() => {
    taskStore.removeFromHistory(task.taskId)
    ElMessage.success(t('taskHistory.messages.deleteSuccess'))
  }).catch(() => {})
}
</script>

<style scoped>
.task-history-page {
}

/* ============================================
   PAGE HEADER
   ============================================ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.page-header h2 {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.page-header p {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 14px;
}

/* ============================================
   CARD STYLES
   ============================================ */
:deep(.el-card) {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
}

:deep(.el-card__body) {
  padding: var(--space-lg);
}

/* ============================================
   TABLE STYLES
   ============================================ */
:deep(.el-table) {
  background: transparent;
  font-size: 14px;
}

:deep(.el-table__wrapper) {
  background: transparent;
}

:deep(.el-table th.el-table__cell) {
  background: rgba(139, 92, 246, 0.1);
  border-bottom: 1px solid var(--glass-border);
  color: var(--text-primary);
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 14px 0;
}

:deep(.el-table tr:hover td.el-table__cell) {
  background: rgba(139, 92, 246, 0.08);
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255, 255, 255, 0.02);
}

:deep(.el-table .el-table__body tr.current-row td.el-table__cell) {
  background: rgba(139, 92, 246, 0.15);
}

/* ============================================
   TABLE TEXT
   ============================================ */
.task-id {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: var(--color-accent-cyan-light);
}

.table-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.text-muted {
  color: var(--text-muted);
}

/* ============================================
   TEXT-ONLY STATUS STYLES
   ============================================ */
.status-text {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
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

.status-text.cancelled {
  background: rgba(107, 114, 128, 0.15);
  color: var(--text-secondary);
}

.status-text.unknown {
  background: rgba(107, 114, 128, 0.15);
  color: var(--text-muted);
}

/* Model display - text only */
.model-text {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: var(--text-secondary);
}

/* ============================================
   PAGINATION
   ============================================ */
.pagination-container {
  margin-top: var(--space-lg);
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination) {
  color: var(--text-secondary);
}

:deep(.el-pagination button) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

:deep(.el-pagination button:hover) {
  color: var(--color-accent-purple);
}

:deep(.el-pagination button.is-active) {
  background: var(--gradient-primary);
  color: var(--text-primary);
}

:deep(.el-pager li) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
}

:deep(.el-pager li:hover) {
  color: var(--color-accent-purple);
}

:deep(.el-pager li.is-active) {
  background: var(--gradient-primary);
  color: var(--text-primary);
}

/* ============================================
   DIALOG STYLES
   ============================================ */
:deep(.el-dialog) {
  background: var(--glass-bg-heavy);
  backdrop-filter: blur(var(--blur-xl));
  -webkit-backdrop-filter: blur(var(--blur-xl));
  border: 1px solid var(--glass-border);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--glass-border);
}

:deep(.el-dialog__title) {
  color: var(--text-primary);
}

:deep(.el-dialog__body) {
  color: var(--text-secondary);
}

/* ============================================
   TABS IN DIALOG
   ============================================ */
:deep(.el-tabs--border-card) {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  background: rgba(139, 92, 246, 0.1);
}

:deep(.el-tabs__item) {
  color: var(--text-tertiary);
}

:deep(.el-tabs__item.is-active) {
  color: var(--color-accent-purple);
}

:deep(.el-tabs__active-bar) {
  background: var(--gradient-primary);
}

/* ============================================
   CONFIG JSON
   ============================================ */
.config-json {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}

:deep(.config-json .el-textarea__inner) {
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-code-dim);
}

/* ============================================
   REPORT STYLES
   ============================================ */
.json-viewer {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}

:deep(.json-viewer .el-textarea__inner) {
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-code-dim);
}

.trace-container {
  max-height: 600px;
  overflow-y: auto;
}

.trace-message {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  transition: all var(--duration-normal) var(--ease-out-cubic);
}

.trace-message:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.3);
}

.trace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.role-user {
  background: rgba(139, 92, 246, 0.15);
  color: var(--color-accent-purple);
}

.role-badge.role-ai {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-accent-green);
}

.trace-index {
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'Consolas', monospace;
}

.trace-content {
  margin: 0;
  padding: var(--space-md);
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-sm);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-code-dim);
  max-height: 400px;
  overflow-y: auto;
}

.commands-container {
  max-height: 600px;
  overflow-y: auto;
}

.command-item {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  transition: all var(--duration-normal) var(--ease-out-cubic);
}

.command-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.command-index {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: var(--space-xs);
}

.command-content {
  margin: 0;
  padding: var(--space-md);
  background: rgba(0, 0, 0, 0.4);
  border-radius: var(--radius-sm);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-code-dim);
}

/* ============================================
   DESCRIPTIONS
   ============================================ */
:deep(.el-descriptions) {
  color: var(--text-secondary);
}

:deep(.el-descriptions__label) {
  color: var(--text-secondary);
}

:deep(.el-descriptions__content) {
  color: var(--text-primary);
}

:deep(.el-descriptions__cell) {
  border-color: var(--glass-border);
}

/* ============================================
   ACTION BUTTONS
   ============================================ */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.action-buttons :deep(.el-button) {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--glass-border);
  color: var(--text-secondary);
  margin: 0;
}

.action-buttons :deep(.el-button:hover) {
  background: rgba(139, 92, 246, 0.15);
  border-color: var(--color-accent-purple);
  color: var(--text-primary);
}

:deep(.el-button--primary) {
  background: var(--gradient-primary);
  border: none;
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  border: none;
}

/* ============================================
   ALERT
   ============================================ */
:deep(.el-alert) {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  :deep(.el-table .el-table__cell) {
    padding: var(--space-sm) 0;
  }

  .pagination-container {
    justify-content: center;
  }
}
</style>
