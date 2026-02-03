<template>
  <div class="task-history-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h2>历史任务</h2>
        <p>查看和管理过往的评测任务</p>
      </div>
      <el-button type="primary" @click="handleNewTask" size="large">
        创建新任务
      </el-button>
    </div>

    <!-- 任务列表 -->
    <el-card>
      <el-table 
        :data="paginatedTasks" 
        stripe 
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: '#fafafa', color: '#606266', fontWeight: '500' }"
      >
        <el-table-column type="index" label="#" width="60" />
        
        <el-table-column prop="taskId" label="任务 ID" min-width="220">
          <template #default="{ row }">
            <span class="task-id">{{ row.taskId }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="startTime" label="创建时间" width="180" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="config.software" label="Software" width="140">
          <template #default="{ row }">
            <span v-if="row.config" class="table-text">{{ row.config.software }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="config.llm_name" label="模型" width="160">
          <template #default="{ row }">
            <el-tag v-if="row.config" effect="plain" size="small">
              {{ row.config.llm_name }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="config.dataset_name" label="数据集" width="160">
          <template #default="{ row }">
            <span v-if="row.config" class="table-text">{{ row.config.dataset_name }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="handleView(row)">
                查看详情
              </el-button>
              <el-button size="small" type="primary" @click="handleRetry(row)">
                重新运行
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
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
      title="任务详情" 
      width="900px"
    >
      <el-descriptions :column="2" border v-if="selectedTask">
        <el-descriptions-item label="任务 ID" :span="2">
          <span class="task-id">{{ selectedTask.taskId }}</span>
        </el-descriptions-item>
        
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedTask.status)">
            {{ getStatusText(selectedTask.status) }}
          </el-tag>
        </el-descriptions-item>
        
        <el-descriptions-item label="创建时间">
          {{ selectedTask.startTime }}
        </el-descriptions-item>
        
        <el-descriptions-item label="Agent 软件" v-if="selectedTask.config">
          {{ selectedTask.config.software }}
        </el-descriptions-item>
        
        <el-descriptions-item label="LLM 模型" v-if="selectedTask.config">
          {{ selectedTask.config.llm_name }}
        </el-descriptions-item>
        
        <el-descriptions-item label="数据集" v-if="selectedTask.config">
          {{ selectedTask.config.dataset_name }}
        </el-descriptions-item>
        
        <el-descriptions-item label="攻击方法" v-if="selectedTask.config">
          {{ selectedTask.config.attack_method_name || '无' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="完整配置" :span="2" v-if="selectedTask.config">
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
        <el-button @click="detailDialogVisible = false" size="large">关闭</el-button>
        <el-button type="success" @click="handleViewReport(selectedTask)" size="large">
          查看完整报告
        </el-button>
        <el-button 
          v-if="selectedTask && selectedTask.status === 'running'" 
          type="primary" 
          @click="handleMonitor(selectedTask)" 
          size="large"
        >
          查看实时监控
        </el-button>
      </template>
    </el-dialog>

    <!-- 完整报告对话框 -->
    <el-dialog 
      v-model="reportDialogVisible" 
      title="完整报告" 
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
          <el-tab-pane label="基本信息">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Sample ID">{{ fullReport.sample_id }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag>{{ fullReport.status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="攻击结果" :span="2">
                <el-tag :type="(fullReport.result?.attack_success === 'success' || fullReport.result?.attack_success === true) ? 'danger' : 'success'">
                  {{ (fullReport.result?.attack_success === 'success' || fullReport.result?.attack_success === true) ? '攻击成功' : '攻击失败' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="开始时间" v-if="fullReport.stats">
                {{ new Date(fullReport.stats.started_at * 1000).toLocaleString() }}
              </el-descriptions-item>
              <el-descriptions-item label="完成时间" v-if="fullReport.stats">
                {{ new Date(fullReport.stats.completed_at * 1000).toLocaleString() }}
              </el-descriptions-item>
              <el-descriptions-item label="耗时" v-if="fullReport.stats">
                {{ Math.round(fullReport.stats.duration) }} 秒
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="评分详情" v-if="fullReport.result?.scores">
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

          <el-tab-pane label="对话历史" v-if="fullReport.result?.trace">
            <div class="trace-container">
              <div v-for="(msg, idx) in fullReport.result.trace" :key="idx" class="trace-message">
                <div class="trace-header">
                  <el-tag :type="msg.role === 'user' ? 'primary' : 'success'" size="small">
                    {{ msg.role === 'user' ? '用户' : 'AI' }}
                  </el-tag>
                  <span class="trace-index">#{{ idx + 1 }}</span>
                </div>
                <pre class="trace-content">{{ msg.content }}</pre>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="执行命令" v-if="fullReport.result?.commands_executed">
            <div class="commands-container">
              <div v-for="(cmd, idx) in fullReport.result.commands_executed" :key="idx" class="command-item">
                <div class="command-index">#{{ idx + 1 }}</div>
                <pre class="command-content">{{ cmd }}</pre>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="样本信息" v-if="fullReport.sample">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="ID">{{ fullReport.sample.id }}</el-descriptions-item>
              <el-descriptions-item label="输入">
                <pre style="white-space: pre-wrap;">{{ fullReport.sample.input }}</pre>
              </el-descriptions-item>
              <el-descriptions-item label="元数据" v-if="fullReport.sample.metadata">
                <el-input 
                  type="textarea" 
                  :value="JSON.stringify(fullReport.sample.metadata, null, 2)" 
                  :rows="10" 
                  readonly
                />
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="完整 JSON">
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
        <el-button @click="reportDialogVisible = false" size="large">关闭</el-button>
        <el-button type="primary" @click="downloadReport" size="large" :disabled="!fullReport">
          下载报告 JSON
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskStore } from '@/stores/task'

const router = useRouter()
const taskStore = useTaskStore()

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

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    running: '运行中',
    finished: '已完成',
    error: '错误',
    cancelled: '已取消'
  }
  return map[status] || '未知'
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
    reportError.value = error.message || '获取报告失败，请稍后重试'
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
  ElMessage.success('报告已下载')
}

const handleRetry = async (task: any) => {
  try {
    await ElMessageBox.confirm('确定要使用相同配置重新运行此任务吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    // 判断任务类型并启动
    if (!task.config) {
      ElMessage.error('任务配置不存在，无法重新运行')
      return
    }
    
    loading.value = true
    
    try {
      let result
      // 根据配置判断是数据集任务还是单样本任务
      if (task.config.dataset_name) {
        // 数据集任务
        result = await taskStore.startDatasetTask(task.config)
      } else if (task.config.question || task.config.prompt) {
        // 单样本任务
        result = await taskStore.startSingleSampleTask(task.config)
      } else {
        ElMessage.error('无法识别任务类型')
        return
      }
      
      ElMessage.success('任务已重新启动')
      // 跳转到监控页面
      router.push(`/tasks/monitor/${result.task_id}`)
    } catch (error: any) {
      console.error('[TaskHistory] 重新运行任务失败:', error)
      ElMessage.error(error.message || '启动任务失败')
    } finally {
      loading.value = false
    }
  } catch {
    // 用户取消操作
  }
}

const handleDelete = (task: any) => {
  ElMessageBox.confirm('确定要删除此任务记录吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    taskStore.removeFromHistory(task.taskId)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.task-history-page {
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

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

:deep(.el-card__body) {
  padding: 24px;
}

.task-id {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #409eff;
}

.table-text {
  font-size: 14px;
  color: #606266;
}

.text-muted {
  color: #c0c4cc;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.config-json {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table td) {
  padding: 14px 0;
}

/* 报告对话框样式 */
.json-viewer {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}

.trace-container {
  max-height: 600px;
  overflow-y: auto;
}

.trace-message {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #fafafa;
}

.trace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.trace-index {
  font-size: 12px;
  color: #909399;
  font-family: 'Consolas', monospace;
}

.trace-content {
  margin: 0;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: #303133;
  max-height: 400px;
  overflow-y: auto;
}

.commands-container {
  max-height: 600px;
  overflow-y: auto;
}

.command-item {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #fafafa;
}

.command-index {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  margin-bottom: 6px;
}

.command-content {
  margin: 0;
  padding: 12px;
  background-color: #2d2d2d;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: #d4d4d4;
}
</style>
