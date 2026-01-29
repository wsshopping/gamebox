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
  }
}
