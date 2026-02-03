/**
 * 类型定义文件
 * 与后端 API 保持完全一致
 */

// ==================== 基础类型 ====================

export type TaskMode = 'dataset' | 'single_sample'
export type TaskStatus = 'pending' | 'connecting' | 'running' | 'finished' | 'error' | 'cancelled'

// ==================== 请求类型 ====================

/**
 * 文件攻击配置
 */
export interface FileAttack {
  name: string
  content: string
  container_path: string
  metadata?: Record<string, any>
}

/**
 * 样本配置
 */
export interface Sample {
  id: string
  input: string
  target?: string | null
  metadata?: Record<string, any>
  test_spec?: Record<string, any>
}

/**
 * 数据集任务请求
 */
export interface DatasetTaskRequest {
  software: string
  llm_name: string
  dataset_name: string
  attack_method_name: string
  mcp_server_config: string
  skip_completed: boolean
  user: string
  filter_dict: Record<string, any>
}

/**
 * 单样本任务请求
 */
export interface SingleSampleRequest {
  sample: Sample
  software: string
  llm_name: string
  dataset_name: string
  attack_method_name: string
  user: string
  file_attacks?: FileAttack[]
  mcp_server_config?: Record<string, any> | null
  container_preparation_script?: string | null
  ide_settings?: Record<string, any>
}

// ==================== 响应类型 ====================

/**
 * 通用 API 响应
 */
export interface APIResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 任务启动响应
 */
export interface TaskStartResponse {
  task_id: string
  frame_endpoint?: string
  websocket_endpoint?: string
  sample_id?: string
}

/**
 * 评分结果
 */
export interface ScoreResult {
  name: string
  value: number | string
  explanation?: string
}

/**
 * 任务结果
 */
export interface TaskResult {
  task_id: string
  sample_id?: string
  status?: string
  attack_success?: boolean | 'success' | 'failure'  // 后端可能返回字符串或布尔值
  scores?: ScoreResult[]
  timestamp?: number
}

/**
 * WebSocket 消息
 */
export interface WSMessage {
  code: number
  message: string
  data: {
    frame?: string
    log?: string | { message: string; level?: string }
    result?: TaskResult
    timestamp?: number
  }
}

/**
 * 任务信息（本地存储）
 */
export interface TaskInfo {
  taskId: string
  config: DatasetTaskRequest | SingleSampleRequest
  startTime: string
  endTime?: string
  status: TaskStatus
}
