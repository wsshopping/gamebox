import { request } from '../http'

export interface IMTokenResponse {
  appKey: string
  token: string
  serverList: string[]
  userId: string
}

export interface IMJoinGroupRequest {
  groupId: string
  groupName?: string
  groupPortrait?: string
}

export interface IMGroupAnnouncementResponse {
  groupId: string
  content: string
  updatedAt: number
  updatedBy: string
  canEdit: boolean
}

export interface IMGroupAnnouncementRequest {
  groupId: string
  content: string
}

export const imApi = {
  getToken: async (): Promise<IMTokenResponse> => {
    return request<IMTokenResponse>('/portal/im/token')
  },
  joinGroup: async (payload: IMJoinGroupRequest): Promise<boolean> => {
    await request('/portal/im/groups/join', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    return true
  },
  getGroupAnnouncement: async (groupId: string): Promise<IMGroupAnnouncementResponse> => {
    return request<IMGroupAnnouncementResponse>(`/portal/im/groups/announcement?groupId=${encodeURIComponent(groupId)}`)
  },
  setGroupAnnouncement: async (payload: IMGroupAnnouncementRequest): Promise<IMGroupAnnouncementResponse> => {
    return request<IMGroupAnnouncementResponse>('/portal/im/groups/announcement', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }
}
