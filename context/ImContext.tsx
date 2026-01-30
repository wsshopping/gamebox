import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { imApi } from '../services/api/im'
import {
  createIMClient,
  IMConnectionState,
  IMConversationOrder,
  IMEvent,
  IMMessageType,
  IMClient
} from '../services/im/client'

type ImConversation = any
type ImMessage = any
type ImGroupInfo = {
  groupId: string
  groupName?: string
  groupPortrait?: string
  isMute?: number
  updatedTime?: number
  extFields?: Record<string, string>
  settings?: Record<string, string>
}
type ImGroupMember = {
  memberId: string
  isMute?: number
  isAllow?: number
  grpDisplayName?: string
  extFields?: Record<string, string>
}
type ImGroupMembers = {
  items: ImGroupMember[]
  offset?: string
}
type ImCreateGroupPayload = {
  groupId?: string
  groupName: string
  groupPortrait?: string
  category?: string
  desc?: string
  tags?: string[]
}
type ImCreateGroupResponse = {
  groupId: string
}

type ImDebugInfo = {
  lastRefreshAt: number | null
  lastConnectedAt: number | null
  lastDisconnectedAt: number | null
  lastErrorAt: number | null
  lastConnectStartAt: number | null
  lastConnectSuccessAt: number | null
  lastConnectFailAt: number | null
  lastConnectDurationMs: number | null
  lastConnectError: string
  connectAttempts: number
  lastTokenAt: number | null
  lastState: number | null
  lastServerList: string[]
  lastProbeAt: number | null
  lastProbeUrl: string
  lastProbeResult: string
  lastProbeError: string
  lastProbeDurationMs: number | null
}

type ImDebugLogItem = {
  ts: number
  msg: string
}

interface ImContextValue {
  ready: boolean
  connected: boolean
  error: string | null
  conversations: ImConversation[]
  messagesByConversation: Record<string, ImMessage[]>
  debug: ImDebugInfo
  debugLogs: ImDebugLogItem[]
  probeWebsocket: () => Promise<void>
  reconnect: () => void
  ensureConnected: (timeoutMs?: number) => Promise<boolean>
  refreshConversations: () => Promise<void>
  loadMessages: (conversationId: string, conversationType: number) => Promise<ImMessage[]>
  loadMoreMessages: (conversationId: string, conversationType: number, beforeTime: number, count?: number) => Promise<{
    messages: ImMessage[]
    isFinished: boolean
  }>
  sendTextMessage: (conversationId: string, conversationType: number, text: string) => Promise<ImMessage | null>
  clearConversationUnread: (conversationId: string, conversationType: number, unreadIndex?: number) => Promise<void>
  removeConversation: (conversationId: string, conversationType: number) => Promise<void>
  setTopConversation: (conversationId: string, conversationType: number, isTop: boolean) => Promise<void>
  getGroupInfo: (groupId: string) => Promise<ImGroupInfo | null>
  getGroupMembers: (groupId: string) => Promise<ImGroupMembers | null>
  createGroup: (payload: ImCreateGroupPayload) => Promise<ImCreateGroupResponse | null>
}

const ImContext = createContext<ImContextValue | undefined>(undefined)

const buildKey = (conversationId: string, conversationType: number) => `${conversationType}:${conversationId}`
const connectTimeoutMs = 15000
const ensureReconnectAfterMs = 3000
const autoReconnectLimit = 2
const debugLogLimit = 50
const enableImDebug = true
const messageOrderBackward = 0

const sortMessages = (messages: ImMessage[]) => {
  return [...messages].sort((a, b) => (a?.sentTime || 0) - (b?.sentTime || 0))
}

const mergeMessage = (messages: ImMessage[], message: ImMessage) => {
  if (!message) return messages
  const messageId = message.messageId || message.tid
  if (messageId && messages.some(item => item.messageId === messageId || item.tid === messageId)) {
    return messages
  }
  return sortMessages([...messages, message])
}

const mergeMessages = (existing: ImMessage[], incoming: ImMessage[]) => {
  const map = new Map<string, ImMessage>()
  const buildId = (msg: ImMessage) => {
    const messageId = msg?.messageId || msg?.tid
    if (messageId) return String(messageId)
    const sender = (msg as any)?.sender?.id || (msg as any)?.senderId || ''
    const sentTime = msg?.sentTime || 0
    return `${sender}-${sentTime}`
  }
  existing.forEach(msg => {
    map.set(buildId(msg), msg)
  })
  incoming.forEach(msg => {
    map.set(buildId(msg), msg)
  })
  return sortMessages(Array.from(map.values()))
}

const getSentTimeRange = (messages: ImMessage[]) => {
  let min = 0
  let max = 0
  messages.forEach(msg => {
    const sentTime = msg?.sentTime || 0
    if (!sentTime) return
    if (!min || sentTime < min) min = sentTime
    if (sentTime > max) max = sentTime
  })
  return { min, max }
}

const logIm = (...args: any[]) => {
  if (!enableImDebug) return
  console.log('[IM]', ...args)
}

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string) => {
  let timer: number | null = null
  try {
    return await new Promise<T>((resolve, reject) => {
      timer = window.setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
      promise
        .then(resolve)
        .catch(reject)
    })
  } finally {
    if (timer) {
      window.clearTimeout(timer)
    }
  }
}

export const ImProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const clientRef = useRef<IMClient | null>(null)
  const currentUserRef = useRef<string | null>(null)
  const refreshTimerRef = useRef<number | null>(null)
  const connectingRef = useRef(false)
  const connectAttemptsRef = useRef(0)
  const [connectNonce, setConnectNonce] = useState(0)
  const connectedRef = useRef(false)
  const lastConnectStartRef = useRef<number | null>(null)
  const connectWatchdogRef = useRef<number | null>(null)
  const autoReconnectCountRef = useRef(0)

  const [ready, setReady] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ImConversation[]>([])
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ImMessage[]>>({})
  const [debugLogs, setDebugLogs] = useState<ImDebugLogItem[]>([])
  const [debugInfo, setDebugInfo] = useState<ImDebugInfo>({
    lastRefreshAt: null,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    lastErrorAt: null,
    lastConnectStartAt: null,
    lastConnectSuccessAt: null,
    lastConnectFailAt: null,
    lastConnectDurationMs: null,
    lastConnectError: '',
    connectAttempts: 0,
    lastTokenAt: null,
    lastState: null,
    lastServerList: [],
    lastProbeAt: null,
    lastProbeUrl: '',
    lastProbeResult: '',
    lastProbeError: '',
    lastProbeDurationMs: null
  })

  const appendDebugLog = useCallback((msg: string) => {
    setDebugLogs(prev => {
      const next = [...prev, { ts: Date.now(), msg }]
      if (next.length > debugLogLimit) {
        return next.slice(next.length - debugLogLimit)
      }
      return next
    })
  }, [])

  useEffect(() => {
    connectedRef.current = connected
  }, [connected])

  const formatState = (state: number) => {
    if (state === IMConnectionState.CONNECTED) return 'CONNECTED'
    if (state === IMConnectionState.CONNECTING) return 'CONNECTING'
    if (state === IMConnectionState.DISCONNECTED) return 'DISCONNECTED'
    if (state === IMConnectionState.CONNECT_FAILED) return 'CONNECT_FAILED'
    if (state === IMConnectionState.DB_OPENED) return 'DB_OPENED'
    if (state === IMConnectionState.DB_CLOSED) return 'DB_CLOSED'
    if (state === IMConnectionState.RECONNECTING) return 'RECONNECTING'
    return `STATE_${state}`
  }

  const buildWsUrl = (baseUrl: string) => {
    const trimmed = String(baseUrl || '').trim()
    if (!trimmed) return ''
    let wsBase = trimmed
    if (wsBase.startsWith('http://')) {
      wsBase = `ws://${wsBase.slice(7)}`
    } else if (wsBase.startsWith('https://')) {
      wsBase = `wss://${wsBase.slice(8)}`
    } else if (!wsBase.startsWith('ws://') && !wsBase.startsWith('wss://')) {
      wsBase = `ws://${wsBase}`
    }
    if (wsBase.endsWith('/im')) {
      return wsBase
    }
    return `${wsBase.replace(/\/$/, '')}/im`
  }

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }

  const clearConnectWatchdog = () => {
    if (connectWatchdogRef.current) {
      window.clearTimeout(connectWatchdogRef.current)
      connectWatchdogRef.current = null
    }
  }

  const refreshConversations = useCallback(async () => {
    const client = clientRef.current
    if (!client) return
    try {
      const { conversations: list } = await client.getConversations({
        order: IMConversationOrder.BACKWARD,
        count: 50,
        time: 0
      })
      const sorted = [...(list || [])].sort((a, b) => {
        const aTop = a?.isTop ? 1 : 0
        const bTop = b?.isTop ? 1 : 0
        if (aTop !== bTop) return bTop - aTop
        return (b?.sortTime || 0) - (a?.sortTime || 0)
      })
      setConversations(sorted)
      setDebugInfo(prev => ({ ...prev, lastRefreshAt: Date.now() }))
      appendDebugLog(`refresh conversations ok (${sorted.length})`)
    } catch (err: any) {
      setError(err?.message || 'IM会话加载失败')
      setDebugInfo(prev => ({ ...prev, lastErrorAt: Date.now() }))
      appendDebugLog(`refresh conversations failed: ${err?.message || 'IM会话加载失败'}`)
    }
  }, [appendDebugLog])

  const scheduleRefresh = useCallback(() => {
    clearRefreshTimer()
    refreshTimerRef.current = window.setTimeout(() => {
      refreshConversations().catch(() => null)
    }, 120)
  }, [refreshConversations])

  const loadMessages = useCallback(async (conversationId: string, conversationType: number) => {
    const client = clientRef.current
    if (!client) return []
    const { messages } = await client.getMessages({ conversationId, conversationType })
    const sorted = sortMessages(messages || [])
    const range = getSentTimeRange(sorted)
    logIm('loadMessages', { conversationId, conversationType, count: sorted.length, range })
    setMessagesByConversation(prev => ({
      ...prev,
      [buildKey(conversationId, conversationType)]: sorted
    }))
    return sorted
  }, [])

  const loadMoreMessages = useCallback(async (conversationId: string, conversationType: number, beforeTime: number, count = 20) => {
    const client = clientRef.current
    if (!client) return { messages: [], isFinished: true }
    logIm('loadMoreMessages:start', { conversationId, conversationType, beforeTime, count })
    const { messages, isFinished } = await client.getMessages({
      conversationId,
      conversationType,
      time: beforeTime,
      count,
      order: messageOrderBackward
    })
    const sorted = sortMessages(messages || [])
    const range = getSentTimeRange(sorted)
    logIm('loadMoreMessages:done', { conversationId, conversationType, count: sorted.length, isFinished, range })
    const key = buildKey(conversationId, conversationType)
    setMessagesByConversation(prev => {
      const existing = prev[key] || []
      const merged = mergeMessages(existing, sorted)
      return { ...prev, [key]: merged }
    })
    return { messages: sorted, isFinished: Boolean(isFinished) }
  }, [])

  const sendTextMessage = useCallback(async (conversationId: string, conversationType: number, text: string) => {
    const client = clientRef.current
    if (!client) return null
    const payload = {
      conversationId,
      conversationType,
      name: IMMessageType.TEXT,
      content: { text }
    }
    const sent = await client.sendMessage(payload)
    setMessagesByConversation(prev => {
      const key = buildKey(conversationId, conversationType)
      const list = mergeMessage(prev[key] || [], sent)
      return { ...prev, [key]: list }
    })
    scheduleRefresh()
    return sent
  }, [scheduleRefresh])

  const clearConversationUnread = useCallback(async (conversationId: string, conversationType: number, unreadIndex?: number) => {
    const client = clientRef.current as any
    if (!client?.clearUnreadcount) return
    let nextIndex = unreadIndex || 0
    if (!nextIndex) {
      const current = conversations.find((item: any) => item.conversationId === conversationId && item.conversationType === conversationType)
      const latestUnread = Number(current?.latestUnreadIndex || 0)
      const latestRead = Number(current?.latestReadIndex || 0)
      const unreadCount = Number(current?.unreadCount || 0)
      if (latestUnread > 0) {
        nextIndex = latestUnread
      } else if (latestRead > 0 && unreadCount > 0) {
        nextIndex = latestRead + unreadCount
      }
    }
    if (!nextIndex) return
    await client.clearUnreadcount([{
      conversationId,
      conversationType,
      unreadIndex: nextIndex
    }])
    scheduleRefresh()
  }, [conversations, scheduleRefresh])

  const removeConversation = useCallback(async (conversationId: string, conversationType: number) => {
    const client = clientRef.current as any
    if (!client?.removeConversation) return
    await client.removeConversation({ conversationId, conversationType })
    scheduleRefresh()
  }, [scheduleRefresh])

  const setTopConversation = useCallback(async (conversationId: string, conversationType: number, isTop: boolean) => {
    const client = clientRef.current as any
    if (!client?.setTopConversation) return
    await client.setTopConversation({ conversationId, conversationType, isTop })
    scheduleRefresh()
  }, [scheduleRefresh])

  const getGroupInfo = useCallback(async (groupId: string) => {
    const client = clientRef.current as any
    if (!client?.portal?.getGroupInfo) return null
    return client.portal.getGroupInfo(groupId)
  }, [])

  const getGroupMembers = useCallback(async (groupId: string) => {
    const client = clientRef.current as any
    if (!client?.portal?.getGroupMembers) return null
    return client.portal.getGroupMembers(groupId)
  }, [])

  const createGroup = useCallback(async (payload: ImCreateGroupPayload) => {
    const client = clientRef.current as any
    if (!client?.portal?.createGroup) return null
    return client.portal.createGroup(payload)
  }, [])

  const attachListeners = useCallback((client: IMClient) => {
    client.on(IMEvent.STATE_CHANGED, ({ state }: { state: number }) => {
      const isConnected = state === IMConnectionState.CONNECTED
      setDebugInfo(prev => ({ ...prev, lastState: state }))
      appendDebugLog(`state changed: ${formatState(state)}(${state})`)
      setConnected(isConnected)
      if (isConnected) {
        setReady(true)
        setDebugInfo(prev => ({ ...prev, lastConnectedAt: Date.now() }))
        refreshConversations().catch(() => null)
        return
      }
      if (state === IMConnectionState.DISCONNECTED || state === IMConnectionState.CONNECT_FAILED) {
        setReady(false)
        setDebugInfo(prev => ({ ...prev, lastDisconnectedAt: Date.now() }))
      }
    })
    client.on(IMEvent.MESSAGE_RECEIVED, (message: ImMessage) => {
      if (!message) return
      const key = buildKey(message.conversationId, message.conversationType)
      setMessagesByConversation(prev => {
        const list = mergeMessage(prev[key] || [], message)
        return { ...prev, [key]: list }
      })
      scheduleRefresh()
    })
    client.on(IMEvent.CONVERSATION_CHANGED, scheduleRefresh)
    client.on(IMEvent.CONVERSATION_ADDED, scheduleRefresh)
    client.on(IMEvent.CONVERSATION_REMOVED, scheduleRefresh)
  }, [appendDebugLog, refreshConversations, scheduleRefresh])

  const detachListeners = useCallback((client: IMClient) => {
    client.off(IMEvent.STATE_CHANGED)
    client.off(IMEvent.MESSAGE_RECEIVED)
    client.off(IMEvent.CONVERSATION_CHANGED)
    client.off(IMEvent.CONVERSATION_ADDED)
    client.off(IMEvent.CONVERSATION_REMOVED)
  }, [])

  const disconnect = useCallback(async () => {
    appendDebugLog('disconnect called')
    clearConnectWatchdog()
    const client = clientRef.current
    // Reset connection guards early to avoid login-after-logout being blocked.
    currentUserRef.current = null
    connectingRef.current = false
    connectAttemptsRef.current = 0
    autoReconnectCountRef.current = 0
    if (client) {
      detachListeners(client)
      await client.disconnect().catch(() => null)
    }
    clientRef.current = null
    setConnected(false)
    setReady(false)
    setError(null)
    setConversations([])
    setMessagesByConversation({})
    setDebugInfo({
      lastRefreshAt: null,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
      lastErrorAt: null,
      lastConnectStartAt: null,
      lastConnectSuccessAt: null,
      lastConnectFailAt: null,
      lastConnectDurationMs: null,
      lastConnectError: '',
      connectAttempts: 0,
      lastTokenAt: null,
      lastState: null,
      lastServerList: [],
      lastProbeAt: null,
      lastProbeUrl: '',
      lastProbeResult: '',
      lastProbeError: '',
      lastProbeDurationMs: null
    })
    setDebugLogs([])
  }, [appendDebugLog, detachListeners])

  const reconnect = useCallback(() => {
    appendDebugLog('manual reconnect')
    clearConnectWatchdog()
    currentUserRef.current = null
    connectingRef.current = false
    connectAttemptsRef.current = 0
    autoReconnectCountRef.current = 0
    setError(null)
    setReady(false)
    setConnectNonce(prev => prev + 1)
  }, [appendDebugLog])

  const ensureConnected = useCallback(async (timeoutMs = connectTimeoutMs) => {
    if (connectedRef.current) return true
    const startAt = Date.now()
    const attemptReconnect = (reason: string) => {
      appendDebugLog(`ensureConnected reconnect: ${reason}`)
      reconnect()
    }
    if (!connectingRef.current) {
      attemptReconnect('not connecting')
    } else {
      const startedAt = lastConnectStartRef.current
      if (startedAt && Date.now() - startedAt > ensureReconnectAfterMs) {
        attemptReconnect('connecting too long')
      }
    }
    while (Date.now() - startAt < timeoutMs) {
      if (connectedRef.current) return true
      await new Promise(resolve => window.setTimeout(resolve, 200))
    }
    return false
  }, [appendDebugLog, reconnect])

  const probeWebsocket = useCallback(async () => {
    const serverList = debugInfo.lastServerList.length > 0 ? debugInfo.lastServerList : [defaultIMServer]
    const targetUrl = buildWsUrl(serverList[0])
    const startAt = Date.now()
    setDebugInfo(prev => ({
      ...prev,
      lastProbeAt: startAt,
      lastProbeUrl: targetUrl,
      lastProbeResult: '',
      lastProbeError: '',
      lastProbeDurationMs: null
    }))
    if (!targetUrl) {
      setDebugInfo(prev => ({
        ...prev,
        lastProbeResult: 'fail',
        lastProbeError: 'ws url empty',
        lastProbeDurationMs: Date.now() - startAt
      }))
      appendDebugLog('ws probe failed: empty url')
      return
    }
    appendDebugLog(`ws probe start: ${targetUrl}`)
    try {
      await withTimeout(new Promise<void>((resolve, reject) => {
        let finished = false
        const ws = new WebSocket(targetUrl)
        const cleanup = () => {
          ws.onopen = null
          ws.onerror = null
          ws.onclose = null
        }
        ws.onopen = () => {
          if (finished) return
          finished = true
          cleanup()
          ws.close()
          resolve()
        }
        ws.onerror = () => {
          if (finished) return
          finished = true
          cleanup()
          reject(new Error('ws probe error'))
        }
        ws.onclose = (evt) => {
          if (finished) return
          finished = true
          cleanup()
          reject(new Error(`ws closed: ${evt.code}`))
        }
      }), 5000, 'ws probe timeout')
      setDebugInfo(prev => ({
        ...prev,
        lastProbeResult: 'ok',
        lastProbeDurationMs: Date.now() - startAt
      }))
      appendDebugLog('ws probe success')
    } catch (err: any) {
      const message = err?.message || 'ws probe failed'
      setDebugInfo(prev => ({
        ...prev,
        lastProbeResult: 'fail',
        lastProbeError: message,
        lastProbeDurationMs: Date.now() - startAt
      }))
      appendDebugLog(`ws probe failed: ${message}`)
    }
  }, [appendDebugLog, debugInfo.lastServerList])

  useEffect(() => {
    const userId = user?.ID ? String(user.ID) : ''
    if (!userId) {
      disconnect().catch(() => null)
      return
    }
    if (connectingRef.current || currentUserRef.current === userId) {
      return
    }
    connectingRef.current = true
    currentUserRef.current = userId
    setError(null)
    setReady(false)

    let cancelled = false
    const connect = async () => {
      const connectStart = Date.now()
      lastConnectStartRef.current = connectStart
      connectAttemptsRef.current += 1
      const nextAttempt = connectAttemptsRef.current
      setDebugInfo(prev => ({
        ...prev,
        connectAttempts: nextAttempt,
        lastConnectStartAt: connectStart,
        lastConnectError: ''
      }))
      appendDebugLog(`connect start (attempt ${nextAttempt})`)
      clearConnectWatchdog()
      connectWatchdogRef.current = window.setTimeout(() => {
        if (connectedRef.current) return
        if (!connectingRef.current) return
        if (connectAttemptsRef.current !== nextAttempt) return
        if (autoReconnectCountRef.current >= autoReconnectLimit) {
          appendDebugLog('connect watchdog reached limit')
          return
        }
        autoReconnectCountRef.current += 1
        appendDebugLog(`connect watchdog reconnect (${autoReconnectCountRef.current})`)
        reconnect()
      }, ensureReconnectAfterMs)
      try {
        const tokenInfo = await imApi.getToken()
        if (cancelled) return
        setDebugInfo(prev => ({ ...prev, lastTokenAt: Date.now() }))
        appendDebugLog('token fetched')

        const serverList = tokenInfo.serverList && tokenInfo.serverList.length > 0 ? tokenInfo.serverList : [defaultIMServer]
        setDebugInfo(prev => ({ ...prev, lastServerList: serverList }))
        appendDebugLog(`server list: ${serverList.join(', ')}`)
        const client = createIMClient(tokenInfo.appKey, serverList)
        clientRef.current = client
        attachListeners(client)
        await withTimeout(client.connect({
          id: tokenInfo.userId,
          token: tokenInfo.token,
          name: user?.username || '',
          portrait: user?.avatar || ''
        }), connectTimeoutMs, 'IM连接超时')
        if (cancelled) return
        setReady(true)
        clearConnectWatchdog()
        setDebugInfo(prev => ({
          ...prev,
          lastConnectSuccessAt: Date.now(),
          lastConnectDurationMs: Date.now() - connectStart
        }))
        appendDebugLog('connect success')
        refreshConversations().catch(() => null)
      } catch (err: any) {
        if (!cancelled) {
          const errorMessage = err?.message || 'IM连接失败'
          clearConnectWatchdog()
          setError(errorMessage)
          setDebugInfo(prev => ({
            ...prev,
            lastErrorAt: Date.now(),
            lastConnectFailAt: Date.now(),
            lastConnectDurationMs: Date.now() - connectStart,
            lastConnectError: errorMessage
          }))
          appendDebugLog(`connect failed: ${errorMessage}`)
          setReady(false)
          currentUserRef.current = null
          if (clientRef.current) {
            clientRef.current.disconnect().catch(() => null)
          }
        }
      } finally {
        connectingRef.current = false
      }
    }

    connect()
    return () => {
      cancelled = true
      clearConnectWatchdog()
    }
  }, [appendDebugLog, attachListeners, connectNonce, disconnect, refreshConversations, user?.ID, user?.avatar, user?.username])

  useEffect(() => {
    return () => {
      disconnect().catch(() => null)
    }
  }, [disconnect])

  const value: ImContextValue = {
    ready,
    connected,
    error,
    conversations,
    messagesByConversation,
    debug: debugInfo,
    debugLogs,
    probeWebsocket,
    reconnect,
    ensureConnected,
    refreshConversations,
    loadMessages,
    loadMoreMessages,
    sendTextMessage,
    clearConversationUnread,
    removeConversation,
    setTopConversation,
    getGroupInfo,
    getGroupMembers,
    createGroup
  }

  return <ImContext.Provider value={value}>{children}</ImContext.Provider>
}

export const useIm = () => {
  const context = useContext(ImContext)
  if (!context) {
    throw new Error('useIm must be used within an ImProvider')
  }
  return context
}

const defaultIMServer = 'http://45.207.194.124:9003'
