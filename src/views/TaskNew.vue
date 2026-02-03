<template>
  <div class="task-new-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>创建评测任务</h2>
      <p>配置 Coding Agent 评测参数并启动任务</p>
    </div>

    <!-- 配置表单 -->
    <el-card class="form-card">
      <el-form :model="formData" label-width="110px" label-position="left" size="default">
        
        <!-- 评测模式 -->
        <el-form-item label="评测模式">
          <el-radio-group v-model="formData.mode">
            <el-radio value="dataset">数据集批量评测</el-radio>
            <el-radio value="single_sample">单样本评测</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider content-position="left">基础配置</el-divider>

        <!-- 第一行 -->
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="Agent 软件">
              <el-select v-model="formData.software" placeholder="选择软件">
                <el-option label="vscode_cli" value="vscode_cli" />
                <el-option label="vscode_ide" value="vscode_ide" />
                <el-option label="cline_ide" value="cline_ide" />
                <el-option label="copilot_ide" value="copilot_ide" />
                <el-option label="cursor_ide" value="cursor_ide" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="LLM 模型">
              <el-select v-model="formData.llm_name" placeholder="选择模型" filterable>
                <el-option label="deepseek-chat" value="deepseek-chat" />
                <el-option label="gemini-3-flash" value="gemini-3-flash" />
                <el-option label="claude-sonnet-4-5" value="claude-sonnet-4-5" />
                <el-option label="gpt-5.1-codex" value="gpt-5.1-codex" />
                <el-option label="gpt-4o-mini" value="gpt-4o-mini" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="数据集">
              <el-select v-model="formData.dataset_name" placeholder="选择数据集">
                <el-option label="redcode" value="redcode" />
                <el-option label="swebench" value="swebench" />
                <el-option label="ipi_web_dataset" value="ipi_web_dataset" />
                <el-option label="cvebench" value="cvebench" />
                <el-option label="mydataset" value="mydataset" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行 -->
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="攻击方法">
              <el-input 
                v-model="formData.attack_method_name" 
                placeholder="留空表示不使用攻击方法"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="用户名">
              <el-input 
                v-model="formData.user" 
                placeholder="默认: default"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- ========== 数据集模式专用配置 ========== -->
        <template v-if="formData.mode === 'dataset'">
          <el-divider content-position="left">数据集配置</el-divider>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="跳过已完成">
                <el-switch v-model="formData.skip_completed" />
                <span class="form-tip">关闭后会重新评测已完成的任务</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="过滤条件">
            <el-input 
              v-model="filterDictStr" 
              type="textarea"
              :rows="4"
              placeholder='JSON 格式，例如: {"id": ["ipi_dl_cl_001"]}'
            />
            <div class="form-tip">
              根据数据集类型使用不同的过滤条件：<br>
              • redcode: {"ids": ["1"], "language": ["python"], "category": ["1", "2"]}<br>
              • ipi_web_dataset: {"id": ["ipi_dl_cl_001"]}<br>
              • cvebench: {"challenges": ["CVE-2023-37999"], "variants": ["one_day"]}
            </div>
          </el-form-item>

          <el-form-item label="MCP 配置">
            <el-input 
              v-model="formData.mcp_server_config" 
              type="textarea"
              :rows="3"
              placeholder='可选：JSON 格式的 MCP 服务器配置'
            />
          </el-form-item>
        </template>

        <!-- ========== 单样本模式专用配置 ========== -->
        <template v-if="formData.mode === 'single_sample'">
          <el-divider content-position="left">单样本配置</el-divider>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="Sample ID">
                <el-input v-model="formData.sample.id" placeholder="例如: test-001" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="任务指令">
            <el-input 
              v-model="formData.sample.input" 
              type="textarea"
              :rows="5"
              placeholder="输入要让 Agent 执行的任务指令..."
              show-word-limit
              maxlength="2000"
            />
          </el-form-item>

          <el-form-item label="预期目标">
            <el-input 
              v-model="formData.sample.target" 
              type="textarea"
              :rows="3"
              placeholder="可选：描述预期的输出结果或目标状态"
            />
          </el-form-item>

          <el-form-item label="容器准备脚本">
            <el-input 
              v-model="formData.container_preparation_script" 
              type="textarea"
              :rows="3"
              placeholder="可选：容器启动后执行的 bash 脚本，例如: pip install requests"
            />
          </el-form-item>

          <el-form-item label="MCP 配置">
            <el-input 
              v-model="mcpConfigStr" 
              type="textarea"
              :rows="3"
              placeholder='可选：JSON 格式的 MCP 服务器配置'
            />
          </el-form-item>

          <!-- 文件攻击配置 -->
          <el-divider content-position="left">文件攻击配置</el-divider>
          
          <el-form-item>
            <el-button @click="addFileAttack" type="primary">添加文件攻击</el-button>
            <span class="form-tip" style="margin-left: 12px;">
              用于注入恶意文件到容器中进行安全测试
            </span>
          </el-form-item>
          
          <div v-for="(attack, index) in formData.file_attacks" :key="index" class="file-attack-item">
            <el-card shadow="hover">
              <div class="attack-header">
                <span class="attack-title">文件攻击 {{ index + 1 }}</span>
                <el-button size="small" type="danger" @click="removeFileAttack(index)">
                  删除
                </el-button>
              </div>
              
              <el-row :gutter="16" style="margin-top: 12px;">
                <el-col :span="12">
                  <el-form-item label="名称" label-width="80px">
                    <el-input v-model="attack.name" placeholder="攻击名称" size="small" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="容器路径" label-width="80px">
                    <el-input v-model="attack.container_path" placeholder="/home/devuser/project/file.txt" size="small" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="文件内容" label-width="80px">
                <el-input 
                  v-model="attack.content" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="要注入的文件内容..."
                  size="small"
                />
              </el-form-item>
            </el-card>
          </div>

          <!-- Metadata 配置 -->
          <el-divider content-position="left">元数据配置</el-divider>
          
          <el-form-item label="Metadata">
            <el-input 
              v-model="metadataStr" 
              type="textarea"
              :rows="3"
              placeholder='可选：JSON 格式的元数据，例如: {"custom_key": "value"}'
            />
          </el-form-item>

          <el-form-item label="Test Spec">
            <el-input 
              v-model="testSpecStr" 
              type="textarea"
              :rows="3"
              placeholder='可选：JSON 格式的测试规范'
            />
          </el-form-item>

          <el-form-item label="IDE Settings">
            <el-input 
              v-model="ideSettingsStr" 
              type="textarea"
              :rows="8"
              placeholder='可选：IDE 配置，JSON 格式'
            />
            <el-link type="primary" :underline="false" style="margin-top: 8px;" @click="fillDefaultIdeSettings">
              使用推荐配置
            </el-link>
          </el-form-item>
        </template>

        <!-- 提交按钮 -->
        <el-form-item style="margin-top: 32px;">
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="loading"
            size="large"
          >
            启动评测任务
          </el-button>
          <el-button @click="handleReset" size="large">重置表单</el-button>
          <el-button @click="handlePreview" size="large">预览配置</el-button>
        </el-form-item>

      </el-form>
    </el-card>

    <!-- 配置预览对话框 -->
    <el-dialog 
      v-model="previewDialogVisible" 
      title="配置预览" 
      width="700px"
    >
      <el-input
        v-model="previewConfig"
        type="textarea"
        :rows="20"
        readonly
        class="preview-json"
      />
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyConfig">复制配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import type { DatasetTaskRequest, SingleSampleRequest } from '@/types'

const router = useRouter()
const taskStore = useTaskStore()
const loading = ref(false)
const previewDialogVisible = ref(false)

const formData = ref({
  mode: 'dataset',
  software: 'cline_ide',
  llm_name: 'gemini-3-flash',
  dataset_name: 'ipi_web_dataset',
  attack_method_name: '',
  user: 'default',
  skip_completed: true,
  mcp_server_config: '',
  container_preparation_script: '',
  file_attacks: [] as any[],
  sample: {
    id: 'test-001',
    input: '',
    target: ''
  }
})

const filterDictStr = ref('{"id": ["ipi_dl_cl_001"]}')
const mcpConfigStr = ref('')
const metadataStr = ref('{}')
const testSpecStr = ref('{}')
const ideSettingsStr = ref('')

const previewConfig = computed(() => {
  const config: any = {
    mode: formData.value.mode,
    software: formData.value.software,
    llm_name: formData.value.llm_name,
    dataset_name: formData.value.dataset_name,
    attack_method_name: formData.value.attack_method_name,
    user: formData.value.user
  }

  if (formData.value.mode === 'dataset') {
    config.skip_completed = formData.value.skip_completed
    try {
      config.filter_dict = JSON.parse(filterDictStr.value || '{}')
    } catch {
      config.filter_dict = {}
    }
    config.mcp_server_config = formData.value.mcp_server_config || ''
  } else {
    config.sample = {
      ...formData.value.sample,
      metadata: JSON.parse(metadataStr.value || '{}'),
      test_spec: JSON.parse(testSpecStr.value || '{}')
    }
    config.file_attacks = formData.value.file_attacks
    config.container_preparation_script = formData.value.container_preparation_script || null
    try {
      config.mcp_server_config = JSON.parse(mcpConfigStr.value || 'null')
    } catch {
      config.mcp_server_config = null
    }
    try {
      if (ideSettingsStr.value) {
        config.ide_settings = JSON.parse(ideSettingsStr.value)
      }
    } catch {
      config.ide_settings = null
    }
  }

  return JSON.stringify(config, null, 2)
})

const addFileAttack = () => {
  formData.value.file_attacks.push({
    name: '',
    container_path: '/home/devuser/project/',
    content: '',
    metadata: {}
  })
}

const removeFileAttack = (index: number) => {
  formData.value.file_attacks.splice(index, 1)
}

/**
 * 填充默认的 IDE Settings 推荐配置
 */
const fillDefaultIdeSettings = () => {
  const defaultSettings = {
    "remote.SSH.remotePlatform": {
      "docker-container": "linux"
    },
    "github.copilot.nextEditSuggestions.enabled": true,
    "github.copilot.chat.byok.ollamaEndpoint": "http://192.168.244.1:11434",
    "extensions.autoCheckUpdates": false,
    "extensions.autoUpdate": false,
    "update.enableWindowsBackgroundUpdates": false,
    "update.mode": "none",
    "update.showReleaseNotes": false,
    "extensions.ignoreRecommendations": true
  }
  ideSettingsStr.value = JSON.stringify(defaultSettings, null, 2)
  ElMessage.success('已填充推荐的 IDE Settings')
}

/**
 * 验证表单
 */
const validateForm = (): boolean => {
  if (!formData.value.software) {
    ElMessage.warning('请选择 Agent 软件')
    return false
  }
  if (!formData.value.llm_name) {
    ElMessage.warning('请选择 LLM 模型')
    return false
  }
  if (!formData.value.dataset_name) {
    ElMessage.warning('请选择数据集')
    return false
  }
  
  // 单样本模式额外验证
  if (formData.value.mode === 'single_sample') {
    if (!formData.value.sample.id) {
      ElMessage.warning('请输入 Sample ID')
      return false
    }
    if (!formData.value.sample.input) {
      ElMessage.warning('请输入任务指令')
      return false
    }
  }
  
  // 验证 JSON 格式
  if (formData.value.mode === 'dataset') {
    try {
      JSON.parse(filterDictStr.value || '{}')
    } catch {
      ElMessage.warning('过滤条件 JSON 格式错误')
      return false
    }
  } else {
    try {
      JSON.parse(metadataStr.value || '{}')
      JSON.parse(testSpecStr.value || '{}')
      if (mcpConfigStr.value) {
        JSON.parse(mcpConfigStr.value)
      }
      if (ideSettingsStr.value) {
        JSON.parse(ideSettingsStr.value)
      }
    } catch {
      ElMessage.warning('JSON 格式错误，请检查 Metadata、Test Spec、MCP 配置或 IDE Settings')
      return false
    }
  }
  
  return true
}

/**
 * 构建数据集模式请求参数
 */
const buildDatasetPayload = (): DatasetTaskRequest => {
  return {
    software: formData.value.software,
    llm_name: formData.value.llm_name,
    dataset_name: formData.value.dataset_name,
    attack_method_name: formData.value.attack_method_name,
    user: formData.value.user,
    skip_completed: formData.value.skip_completed,
    filter_dict: JSON.parse(filterDictStr.value || '{}'),
    mcp_server_config: formData.value.mcp_server_config || ''
  }
}

/**
 * 构建单样本模式请求参数
 */
const buildSingleSamplePayload = (): SingleSampleRequest => {
  const payload: SingleSampleRequest = {
    sample: {
      id: formData.value.sample.id,
      input: formData.value.sample.input,
      target: formData.value.sample.target || null,
      metadata: JSON.parse(metadataStr.value || '{}'),
      test_spec: JSON.parse(testSpecStr.value || '{}')
    },
    software: formData.value.software,
    llm_name: formData.value.llm_name,
    dataset_name: formData.value.dataset_name,
    attack_method_name: formData.value.attack_method_name,
    user: formData.value.user,
    file_attacks: formData.value.file_attacks,
    mcp_server_config: mcpConfigStr.value ? JSON.parse(mcpConfigStr.value) : null,
    container_preparation_script: formData.value.container_preparation_script || null
  }
  
  // 添加 IDE settings（如果有）
  if (ideSettingsStr.value) {
    payload.ide_settings = JSON.parse(ideSettingsStr.value)
  }
  
  return payload
}

/**
 * 提交表单 - 真实的 API 调用
 */
const handleSubmit = async () => {
  // 验证表单
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    let result
    
    if (formData.value.mode === 'dataset') {
      // 数据集批量评测
      const payload = buildDatasetPayload()
      console.log('[TaskNew] 启动数据集任务:', payload)
      result = await taskStore.startDatasetTask(payload)
    } else {
      // 单样本评测
      const payload = buildSingleSamplePayload()
      console.log('[TaskNew] 启动单样本任务:', payload)
      result = await taskStore.startSingleSampleTask(payload)
    }
    
    // 成功提示
    ElMessage.success('任务启动成功！')
    
    // 跳转到监控页面
    router.push(`/tasks/monitor/${result.task_id}`)
    
  } catch (error: any) {
    console.error('[TaskNew] 启动任务失败:', error)
    ElMessage.error(error.message || '启动任务失败，请检查网络连接或服务器状态')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formData.value = {
    mode: 'dataset',
    software: 'cline_ide',
    llm_name: 'gemini-3-flash',
    dataset_name: 'ipi_web_dataset',
    attack_method_name: '',
    user: 'default',
    skip_completed: true,
    mcp_server_config: '',
    container_preparation_script: '',
    file_attacks: [],
    sample: {
      id: 'test-001',
      input: '',
      target: ''
    }
  }
  filterDictStr.value = '{"id": ["ipi_dl_cl_001"]}'
  mcpConfigStr.value = ''
  metadataStr.value = '{}'
  testSpecStr.value = '{}'
  ElMessage.info('表单已重置')
}

const handlePreview = () => {
  previewDialogVisible.value = true
}

const copyConfig = () => {
  navigator.clipboard.writeText(previewConfig.value)
  ElMessage.success('配置已复制到剪贴板')
}
</script>

<style scoped>
.task-new-page {
  height: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.form-card {
  background: #fff;
}

:deep(.el-card__body) {
  padding: 28px 32px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

:deep(.el-input__inner),
:deep(.el-select),
:deep(.el-textarea__inner) {
  font-size: 13px;
}

:deep(.el-divider) {
  margin: 24px 0;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
  margin-left: 8px;
}

.file-attack-item {
  margin-bottom: 16px;
}

.file-attack-item .el-card {
  border: 1px solid #dcdfe6;
  background: #fafafa;
}

:deep(.file-attack-item .el-card__body) {
  padding: 16px;
}

.attack-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attack-title {
  font-weight: 500;
  font-size: 13px;
  color: #303133;
}

:deep(.el-button--large) {
  padding: 10px 28px;
  font-size: 14px;
}

.preview-json {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}

:deep(.preview-json .el-textarea__inner) {
  background-color: #f5f7fa;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
</style>
