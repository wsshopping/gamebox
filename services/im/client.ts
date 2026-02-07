import IMCore from '@/vendor/juggleim-es-1.9.6.js'

export const IMEvent = IMCore.Event
export const IMConversationType = IMCore.ConversationType
export const IMMessageType = IMCore.MessageType
export const IMConnectionState = IMCore.ConnectionState
export const IMConversationOrder = IMCore.ConversationOrder

export type IMClient = ReturnType<typeof IMCore.init>

export const createIMClient = (appKey: string, serverList: string[]): IMClient => {
  const portalBase = import.meta.env.VITE_BASE_API || '/api/v1'
  const upload = { urllib: true } // OSS upload provider for IM SDK
  const client = IMCore.init({
    appkey: appKey,
    serverList,
    portalBase,
    upload
  })
  try {
    ;(client as any).registerMessage?.([
      {
        name: 'jg:redpacket',
        isCount: true,
        isStorage: true,
        isCommand: false
      }
    ])
  } catch (error) {
    console.warn('register red packet message failed', error)
  }
  return client
}
