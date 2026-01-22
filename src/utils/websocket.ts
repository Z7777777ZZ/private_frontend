/**
 * WebSocket 连接管理工具类
 * 提供自动重连、心跳检测等功能
 */

import type { WSMessage } from '@/types'

export type WSEventType = 'frame' | 'log' | 'result' | 'complete' | 'error' | 'connected' | 'disconnected'
export type WSEventHandler = (data: any) => void

export class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private heartbeatInterval: number | null = null
  private eventHandlers: Map<WSEventType, Set<WSEventHandler>> = new Map()
  private isManualClose = false
  private reconnectTimer: number | null = null

  constructor(url: string) {
    this.url = url
  }

  /**
   * 连接 WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('[WebSocket] 正在连接:', this.url)
        this.ws = new WebSocket(this.url)
        this.isManualClose = false

        this.ws.onopen = () => {
          console.log('[WebSocket] 连接成功')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.emit('connected', null)
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event)
        }

        this.ws.onerror = (error) => {
          console.error('[WebSocket] 连接错误:', error)
          this.emit('error', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('[WebSocket] 连接关闭')
          this.stopHeartbeat()
          this.emit('disconnected', null)

          // 如果不是手动关闭，尝试重连
          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`[WebSocket] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
            
            this.reconnectTimer = window.setTimeout(() => {
              this.connect().catch(console.error)
            }, this.reconnectDelay)
          }
        }
      } catch (error) {
        console.error('[WebSocket] 创建连接失败:', error)
        reject(error)
      }
    })
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent) {
    try {
      const data: WSMessage = JSON.parse(event.data)
      
      // 任务完成消息 (code: 1002)
      if (data.code === 1002) {
        console.log('[WebSocket] 任务完成')
        this.emit('complete', data)
        return
      }

      // 正常数据消息 (code: 0)
      if (data.code === 0 && data.data) {
        if (data.data.frame) {
          this.emit('frame', data.data.frame)
        }
        if (data.data.log) {
          this.emit('log', data.data.log)
        }
        if (data.data.result) {
          this.emit('result', data.data.result)
        }
      }
    } catch (error) {
      console.error('[WebSocket] 消息解析失败:', error)
      this.emit('error', error)
    }
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // 发送心跳包（如果服务器需要）
        // this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 每30秒发送一次心跳
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 注册事件监听器
   */
  on(event: WSEventType, handler: WSEventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler)
  }

  /**
   * 移除事件监听器
   */
  off(event: WSEventType, handler: WSEventHandler) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  /**
   * 触发事件
   */
  private emit(event: WSEventType, data: any) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`[WebSocket] 事件处理器错误 (${event}):`, error)
        }
      })
    }
  }

  /**
   * 发送消息
   */
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data))
    } else {
      console.warn('[WebSocket] 连接未就绪，无法发送消息')
    }
  }

  /**
   * 关闭连接
   */
  close() {
    this.isManualClose = true
    this.stopHeartbeat()
    
    // 清除重连定时器
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.eventHandlers.clear()
    console.log('[WebSocket] 已关闭连接')
  }

  /**
   * 获取连接状态
   */
  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  /**
   * 是否已连接
   */
  get isConnected(): boolean {
    return this.readyState === WebSocket.OPEN
  }
}
