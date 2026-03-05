/**
 * 类型定义文件
 * 与后端 API 保持完全一致
 */

// ==================== 基础类型 ====================

export type TaskMode = 'dataset' | 'single_sample'
export type TaskStatus = 'pending' | 'connecting' | 'running' | 'finished' | 'error' | 'cancelled'

// ==================== 请求类型 ====================

// --- Prompt injection & verification ---
export type InjectionType = 'append' | 'insert_after_match' | 'replace' | 'insert_before_match'

export interface PromptInjection {
  target_file_path: string
  injection_type: InjectionType
  match_pattern: string
  payload_content: string
}

export type VerificationMethod = 'CHECK_NETWORK_LOG' | 'COMMANDS_EXECUTED' | 'LLM_JUDGE' | 'EXEC_IN_CONTAINER'

export interface VerificationConfig {
  method: VerificationMethod
  params: Record<string, any>
}

// --- Sample ---
export interface Sample {
  id: string
  user_instruction: string
  target?: string | null
  thought_process?: string
  metadata?: Record<string, any>
  test_spec?: Record<string, any>
  custom_html_content?: string
  env_setup_script?: string
  html_domain?: string
  html_endpoint?: string
  attacker_domain?: string
  attacker_endpoint?: string
  workspace?: string
  script_to_fetch_from_attacker_server?: string
  prompt_injections?: PromptInjection[]
  evaluation?: Record<string, VerificationConfig[]>
  category: 'Data_Leakage' | 'Host_Environment_Destruction' | 'Harmful_Code_Generation' | 'Resource_Misuse' | 'Context_Pollution'
  subcategory:
    | 'Credential_Leakage'
    | 'User_Information_Leakage'
    | 'Environment_Information_Leakage'
    | 'System_Prompt_Leakage'
    | 'File_System_Destruction'
    | 'Identity_Forgery'
    | 'Privilege_Escalation'
    | 'Network_Abuse'
    | 'Vulnerable_Code_Generation'
    | 'Hallucination_Code_Generation'
    | 'Supply_Chain_Poisoning'
    | 'Malicious_Code_Generation'
    | 'Token_Misuse'
    | 'System_Resource_Abuse'
    | 'Malicious_Instruction_Persistence'
  ide_settings?: Record<string, any>
}

// --- Model / Agent ---
export interface ModelConfig {
  model_name: string
  api_provider?: string
  base_url?: string
  api_key?: string
  model_args?: Record<string, any>
  system_prompt?: string
}

export interface AgentConfig {
  software: 'cc_cli' | 'cline_cli' | 'codex_cli' | 'cline_ide' | 'copilot_ide' | 'cursor_ide' | 'trae_ide'
  model: ModelConfig
  tools?: Record<string, any>[]
  max_turns?: number
  headless?: boolean
}

// --- Extra payload pieces used by UI ---
export interface FileAttack {
  name: string
  container_path: string
  content: string
  metadata?: Record<string, any>
}

// --- ExperimentConfig (shared body for dataset & single-sample) ---
export interface ExperimentConfig {
  agent: AgentConfig
  attack_method_name?: string
  attack_model_name?: string
  dataset_name?: string
  filter_dict?: Record<string, any>
  sample?: Sample | null
  concurrency?: number
  skip_completed?: boolean
  user?: string
  fail_immediately_on_error?: boolean
  screenshot_time?: number | null
  log_level?: string
  debug_port?: number
  mcp_server_config?: any
  container_preparation_script?: string | null
  file_attacks?: FileAttack[]
  ide_settings?: Record<string, any>
}

// --- Request wrappers for UI clarity ---
export type DatasetTaskRequest = ExperimentConfig

export interface SingleSampleRequest extends ExperimentConfig {
  sample: Sample
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
  vm_info?: {
    vm_id: string
    ip: string
    ssh_port: number
    vnc_port: number
    headers?: Record<string, any>
  }
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
  attack_success?: boolean | 'success' | 'failure'
  task_success?: 'success' | 'failure'
  run_success?: 'success' | 'failure'
  scores?: Record<string, any>
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
    sample_id?: string
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
