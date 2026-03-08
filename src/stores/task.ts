/**
 * 任务管理 Store
 * 负责任务的创建、状态管理和历史记录
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type {
  TaskInfo,
  DatasetTaskRequest,
  SingleSampleRequest,
  APIResponse,
  TaskStartResponse,
  TaskStatus
} from '@/types'

// localStorage 存储键
const STORAGE_KEY = 'task_history'
const MAX_HISTORY_COUNT = 50

export const useTaskStore = defineStore('task', () => {
  // ==================== 状态 ====================
  
  const serverUrl = ref('http://10.82.1.215:8083')
  const user = ref('default')
  const currentTask = ref<TaskInfo | null>(null)
  const taskHistory = ref<TaskInfo[]>([])

  // ==================== 计算属性 ====================
  
  /**
   * API 基础 URL
   */
  const apiBaseUrl = computed(() => `${serverUrl.value}/api/v1/coding-agent/tasks`)
  
  /**
   * WebSocket 基础 URL
   */
  const wsBaseUrl = computed(() => {
    const url = serverUrl.value.replace('http://', '').replace('https://', '')
    return `ws://${url}/ws`
  })

  // ==================== API 方法 ====================

  /**
   * 启动数据集批量评测任务
   */
  const startDatasetTask = async (config: DatasetTaskRequest): Promise<TaskStartResponse> => {
    try {
      const response = await axios.post<APIResponse<TaskStartResponse>>(
        apiBaseUrl.value,
        {
          ...config,
          user: user.value
        }
      )

      if (response.data.code === 0) {
        const taskInfo: TaskInfo = {
          taskId: response.data.data.task_id,
          config,
          startTime: new Date().toLocaleString(),
          status: 'running'
        }
        
        currentTask.value = taskInfo
        addToHistory(taskInfo)
        
        return response.data.data
      } else {
        throw new Error(response.data.message || '启动任务失败')
      }
    } catch (error: any) {
      console.error('[Store] 启动数据集任务失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '启动任务失败'
      throw new Error(errorMessage)
    }
  }

  /**
   * 启动单样本评测任务
   */
  const startSingleSampleTask = async (config: SingleSampleRequest): Promise<TaskStartResponse> => {
    try {
      const response = await axios.post<APIResponse<TaskStartResponse>>(
        `${apiBaseUrl.value}/single-sample`,
        {
          ...config,
          user: user.value
        }
      )

      if (response.data.code === 0) {
        const taskInfo: TaskInfo = {
          taskId: response.data.data.task_id,
          config,
          startTime: new Date().toLocaleString(),
          status: 'running'
        }
        
        currentTask.value = taskInfo
        addToHistory(taskInfo)
        
        return response.data.data
      } else {
        throw new Error(response.data.message || '启动任务失败')
      }
    } catch (error: any) {
      console.error('[Store] 启动单样本任务失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '启动任务失败'
      throw new Error(errorMessage)
    }
  }

  /**
   * 取消任务
   */
  const cancelTask = async (taskId: string): Promise<void> => {
    try {
      const response = await axios.post<APIResponse<any>>(
        `${apiBaseUrl.value}/${taskId}/cancel`
      )

      if (response.data.code === 0) {
        updateTaskStatus(taskId, 'cancelled')
      } else {
        throw new Error(response.data.message || '取消任务失败')
      }
    } catch (error: any) {
      console.error('[Store] 取消任务失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '取消任务失败'
      throw new Error(errorMessage)
    }
  }

  /**
   * 获取任务报告
   */
  const fetchReport = async (taskId: string): Promise<any> => {
    try {
      const response = await axios.get<APIResponse<any>>(
        `${apiBaseUrl.value}/${taskId}/report`
      )

      if (response.data.code === 0) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '获取报告失败')
      }
    } catch (error: any) {
      console.error('[Store] 获取报告失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '获取报告失败'
      throw new Error(errorMessage)
    }
  }

  // ==================== 本地状态管理 ====================

  /**
   * 更新任务状态
   */
  const updateTaskStatus = (taskId: string, status: TaskStatus, result?: any) => {
    // 更新当前任务
    if (currentTask.value?.taskId === taskId) {
      currentTask.value.status = status
      if (result) {
        currentTask.value.result = result
      }
      if (status === 'finished' || status === 'error' || status === 'cancelled') {
        currentTask.value.endTime = new Date().toLocaleString()
      }
    }

    // 更新历史记录
    const historyTask = taskHistory.value.find(t => t.taskId === taskId)
    if (historyTask) {
      historyTask.status = status
      if (result) {
        historyTask.result = result
      }
      if (status === 'finished' || status === 'error' || status === 'cancelled') {
        historyTask.endTime = new Date().toLocaleString()
      }
      saveHistory()
    }
  }

  /**
   * 添加到历史记录
   */
  const addToHistory = (task: TaskInfo) => {
    // 检查是否已存在
    const existingIndex = taskHistory.value.findIndex(t => t.taskId === task.taskId)
    if (existingIndex !== -1) {
      // 更新现有记录
      taskHistory.value[existingIndex] = task
    } else {
      // 添加新记录到开头
      taskHistory.value.unshift(task)
    }

    // 限制历史记录数量
    if (taskHistory.value.length > MAX_HISTORY_COUNT) {
      taskHistory.value = taskHistory.value.slice(0, MAX_HISTORY_COUNT)
    }

    saveHistory()
  }

  /**
   * 从历史记录中删除任务
   */
  const removeFromHistory = (taskId: string) => {
    const index = taskHistory.value.findIndex(t => t.taskId === taskId)
    if (index !== -1) {
      taskHistory.value.splice(index, 1)
      saveHistory()
    }
  }

  /**
   * 保存历史记录到 localStorage
   */
  const saveHistory = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(taskHistory.value))
    } catch (error) {
      console.error('[Store] 保存历史记录失败:', error)
    }
  }

  /**
   * 从 localStorage 加载历史记录
   */
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        taskHistory.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('[Store] 加载历史记录失败:', error)
      taskHistory.value = []
    }
  }

  /**
   * 清空历史记录
   */
  const clearHistory = () => {
    taskHistory.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  // 初始化时加载历史记录
  loadHistory()

  // ==================== 返回 ====================

  return {
    // 状态
    serverUrl,
    user,
    currentTask,
    taskHistory,

    // 计算属性
    apiBaseUrl,
    wsBaseUrl,

    // API 方法
    startDatasetTask,
    startSingleSampleTask,
    cancelTask,
    fetchReport,

    // 本地方法
    updateTaskStatus,
    addToHistory,
    removeFromHistory,
    clearHistory,
    loadHistory
  }
})
