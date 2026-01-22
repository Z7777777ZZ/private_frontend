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
        <el-button type="primary" @click="handleMonitor(selectedTask)" size="large">
          查看监控
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

const handleRetry = (task: any) => {
  ElMessageBox.confirm('确定要使用相同配置重新运行此任务吗？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('任务已重新启动')
  }).catch(() => {})
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
</style>
