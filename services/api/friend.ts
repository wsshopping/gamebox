import { request } from '../http'

export type FriendProfile = {
  id: number
  username: string
  avatar?: string
  phone: string
}

export type FriendRequestItem = {
  id: number
  status: string
  time: string
  requester: FriendProfile
  target: FriendProfile
}

export type FriendItem = {
  id: number
  username: string
  avatar?: string
  phone: string
  displayName?: string
}

export type FriendListResponse = {
  items: FriendItem[]
  offset: string
}

type FriendSearchResponse = {
  items: FriendProfile[]
}

type PageResult<T> = {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export const friendApi = {
  search: async (keyword: string): Promise<FriendProfile[]> => {
    const params = new URLSearchParams()
    params.set('keyword', keyword)
    const res = await request<FriendSearchResponse>(`/portal/friends/search?${params.toString()}`)
    return res.items || []
  },
  createRequest: async (targetId: number): Promise<FriendRequestItem> => {
    return request<FriendRequestItem>('/portal/friends/requests', {
      method: 'POST',
      body: JSON.stringify({ targetId })
    })
  },
  listRequests: async (
    direction: 'incoming' | 'outgoing',
    status?: string,
    page = 1,
    pageSize = 20
  ): Promise<PageResult<FriendRequestItem>> => {
    const params = new URLSearchParams()
    params.set('direction', direction)
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    if (status) {
      params.set('status', status)
    }
    return request<PageResult<FriendRequestItem>>(`/portal/friends/requests?${params.toString()}`)
  },
  acceptRequest: async (requestId: number): Promise<boolean> => {
    await request('/portal/friends/requests/accept', {
      method: 'POST',
      body: JSON.stringify({ requestId })
    })
    return true
  },
  rejectRequest: async (requestId: number): Promise<boolean> => {
    await request('/portal/friends/requests/reject', {
      method: 'POST',
      body: JSON.stringify({ requestId })
    })
    return true
  },
  cancelRequest: async (requestId: number): Promise<boolean> => {
    await request('/portal/friends/requests/cancel', {
      method: 'POST',
      body: JSON.stringify({ requestId })
    })
    return true
  },
  listFriends: async (limit = 100, offset = ''): Promise<FriendListResponse> => {
    const params = new URLSearchParams()
    if (limit > 0) {
      params.set('limit', String(limit))
    }
    if (offset) {
      params.set('offset', offset)
    }
    return request<FriendListResponse>(`/portal/friends/list?${params.toString()}`)
  },
  removeFriend: async (targetId: number): Promise<boolean> => {
    await request('/portal/friends/remove', {
      method: 'POST',
      body: JSON.stringify({ targetId })
    })
    return true
  }
}
