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

export interface IMGroupActionRequest {
  groupId: string
}

export interface IMMediaDownloadRequest {
  key: string
  fileName?: string
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

export interface IMGroupRenameRequest {
  groupId: string
  groupName: string
}

export interface IMGroupRenameResponse {
  groupId: string
  groupName: string
}

export interface IMAutoDeletePolicyPayload {
  conversationType: number
  conversationId: string
}

export interface IMAutoDeletePolicySetPayload extends IMAutoDeletePolicyPayload {
  seconds: number
}

export interface IMAutoDeletePolicyResponse extends IMAutoDeletePolicySetPayload {
  canEdit: boolean
}

export interface IMRedPacketSender {
  userId: number
  username: string
  avatar: string
}

export interface IMRedPacketCreateRequest {
  groupId: string
  packetType: 'fixed' | 'random'
  totalAmount: number
  totalCount: number
  greeting: string
  requestId: string
}

export interface IMRedPacketCreateResponse {
  packetId: number
  groupId: string
  packetType: 'fixed' | 'random'
  totalAmount: number
  totalCount: number
  remainingAmount: number
  remainingCount: number
  greeting: string
  status: string
  expireAt: number
  senderCanClaim: boolean
  sender: IMRedPacketSender
}

export interface IMRedPacketClaimRequest {
  packetId: number
  claimRequestId: string
}

export interface IMRedPacketClaimResponse {
  packetId: number
  claimedAmount: number
  status: string
  remainingAmount: number
  remainingCount: number
  myClaimed: boolean
}

export interface IMRedPacketClaimItem {
  claimerId: number
  claimerName: string
  claimerAvatar: string
  amount: number
  claimedAt: number
  createdAt: string
}

export interface IMRedPacketClaimsResponse {
  items: IMRedPacketClaimItem[]
  total: number
}

export interface IMRedPacketDetailResponse {
  packetId: number
  groupId: string
  packetType: 'fixed' | 'random'
  totalAmount: number
  totalCount: number
  remainingAmount: number
  remainingCount: number
  greeting: string
  status: string
  expireAt: number
  myClaimStatus: string
  myClaimedAmount: number
  senderCanClaim: boolean
  sender: IMRedPacketSender
  topClaims: IMRedPacketClaimItem[]
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
  leaveGroup: async (payload: IMGroupActionRequest): Promise<boolean> => {
    await request('/portal/im/groups/leave', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    return true
  },
  disbandGroup: async (payload: IMGroupActionRequest): Promise<boolean> => {
    await request('/portal/im/groups/disband', {
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
  },
  updateGroupName: async (payload: IMGroupRenameRequest): Promise<IMGroupRenameResponse> => {
    return request<IMGroupRenameResponse>('/portal/im/groups/name', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  getAutoDeletePolicy: async (payload: IMAutoDeletePolicyPayload): Promise<IMAutoDeletePolicyResponse> => {
    const query = `conversationType=${encodeURIComponent(String(payload.conversationType))}&conversationId=${encodeURIComponent(payload.conversationId)}`
    return request<IMAutoDeletePolicyResponse>(`/portal/im/auto-delete?${query}`)
  },
  setAutoDeletePolicy: async (payload: IMAutoDeletePolicySetPayload): Promise<IMAutoDeletePolicyResponse> => {
    return request<IMAutoDeletePolicyResponse>('/portal/im/auto-delete', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  createRedPacket: async (payload: IMRedPacketCreateRequest): Promise<IMRedPacketCreateResponse> => {
    return request<IMRedPacketCreateResponse>('/portal/im/red-packets/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  claimRedPacket: async (payload: IMRedPacketClaimRequest): Promise<IMRedPacketClaimResponse> => {
    return request<IMRedPacketClaimResponse>('/portal/im/red-packets/claim', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  getRedPacketDetail: async (packetId: number): Promise<IMRedPacketDetailResponse> => {
    return request<IMRedPacketDetailResponse>(`/portal/im/red-packets/detail?packetId=${encodeURIComponent(String(packetId))}`)
  },
  getRedPacketClaims: async (packetId: number, page = 1, pageSize = 20): Promise<IMRedPacketClaimsResponse> => {
    const query = `packetId=${encodeURIComponent(String(packetId))}&page=${encodeURIComponent(String(page))}&pageSize=${encodeURIComponent(String(pageSize))}`
    return request<IMRedPacketClaimsResponse>(`/portal/im/red-packets/claims?${query}`)
  },
  getMediaDownloadUrl: (payload: IMMediaDownloadRequest): string => {
    const params = new URLSearchParams()
    params.set('key', payload.key)
    if (payload.fileName) {
      params.set('fileName', payload.fileName)
    }
    return `/portal/im/media/download?${params.toString()}`
  },
  getMediaPreviewUrl: (payload: IMMediaDownloadRequest): string => {
    const params = new URLSearchParams()
    params.set('key', payload.key)
    if (payload.fileName) {
      params.set('fileName', payload.fileName)
    }
    return `/portal/im/media/preview?${params.toString()}`
  }
}
