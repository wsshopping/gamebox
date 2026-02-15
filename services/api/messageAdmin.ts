import { request } from '../http'

type PageResult<T> = {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export type SystemNotificationAdminItem = {
  id: number
  title: string
  content: string
  category: string
  level: 'info' | 'warning' | 'success'
  targetType: 'all' | 'user'
  targetUserId?: number
  publishAt?: string
  expireAt?: string | null
  status: 'draft' | 'published' | 'revoked'
  createdBy?: number
  createdAt?: string
  updatedAt?: string
}

export type SystemNotificationListParams = {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  category?: string
  level?: string
  targetType?: string
  targetUserId?: number
}

export type SystemNotificationUpsert = {
  id?: number
  title: string
  content: string
  category: string
  level: 'info' | 'warning' | 'success'
  targetType: 'all' | 'user'
  targetUserId?: number
}

export const messageAdminApi = {
  listSystemNotifications: async (params: SystemNotificationListParams): Promise<PageResult<SystemNotificationAdminItem>> => {
    const data = await request<PageResult<SystemNotificationAdminItem & { ID?: number }>>('/portal-admin/message/system/list', {
      method: 'POST',
      body: JSON.stringify(params)
    })
    return {
      ...data,
      list: (data.list || []).map((item) => ({
        ...item,
        // Backend legacy payload may expose primary key as `ID`.
        id: Number(item.id ?? item.ID ?? 0)
      }))
    }
  },
  createSystemNotification: async (payload: SystemNotificationUpsert): Promise<boolean> => {
    await request('/portal-admin/message/system/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    return true
  },
  updateSystemNotification: async (payload: SystemNotificationUpsert): Promise<boolean> => {
    await request('/portal-admin/message/system/update', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    return true
  },
  deleteSystemNotification: async (id: number): Promise<boolean> => {
    await request('/portal-admin/message/system/delete', {
      method: 'POST',
      body: JSON.stringify({ id })
    })
    return true
  }
}
