
import { request } from '../http'

type PageResult<T> = {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export type PayoutAddressData = {
  chain: string
  address: string
  alipayQrUrl: string
  wechatQrUrl: string
  availableMethods: string[]
  canWithdraw: boolean
  withdrawLockedUntil: string
  cooldownSeconds: number
}

export type AgentGameDepositItem = {
  id: number
  gameId: number
  gameName: string
  amount: string
  status: string
  remark: string
  releaseRemark: string
  releaseRequestedAt: string
  releaseAuditAt: string
  releaseAuditRemark: string
  canRequestRelease: boolean
}

export type DepositReleaseRequestItem = {
  id: number
  agentHierarchyId: number
  agentAccount: string
  inviteCode: string
  role: string
  gameId: number
  gameName: string
  amount: string
  status: string
  remark: string
  releaseRemark: string
  releaseRequestedAt: string
  releaseAuditAt: string
  releaseAuditRemark: string
}

export type PayoutQRCodeChannel = 'alipay' | 'wechat'

export type SuperSensitiveStatus = {
  verified: boolean
  verifiedUntil?: string
  cooldownSeconds?: number
}

const buildQuery = (params?: Record<string, string | number | undefined>) => {
  if (!params) return ''
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return
    search.set(key, String(value))
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const agencyApi = {
  getSuper2FAStatus: async () => {
    return request<{ enabled: boolean; verified: boolean; verifiedUntil?: string; cooldownSeconds?: number }>('/portal/agency/super/2fa/status')
  },
  setupSuper2FA: async () => {
    return request<{ secret: string; otpauthUrl: string; expiresIn: number }>('/portal/agency/super/2fa/setup', {
      method: 'POST'
    })
  },
  enableSuper2FA: async (code: string) => {
    return request('/portal/agency/super/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  },
  verifySuper2FA: async (code: string) => {
    return request<{ enabled: boolean; verified: boolean; verifiedUntil?: string; cooldownSeconds?: number }>('/portal/agency/super/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  },
  disableSuper2FA: async () => {
    return request('/portal/agency/super/2fa/disable', {
      method: 'POST'
    })
  },
  getSuperSensitiveStatus: async () => {
    return request<SuperSensitiveStatus>('/portal/agency/super/sensitive/status')
  },
  verifySuperSensitive: async (secondPassword: string) => {
    return request<SuperSensitiveStatus>('/portal/agency/super/sensitive/verify', {
      method: 'POST',
      body: JSON.stringify({ secondPassword })
    })
  },
  getStats: async () => {
    return request('/portal/agency/stats')
  },
  getAgents: async (params?: { scope?: string; roleId?: number; keyword?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/agents${buildQuery(params)}`)
  },
  createAgent: async (data: any) => {
    return request('/portal/agency/agents', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  updateAgent: async (
    id: number,
    data: {
      phone?: string
      password?: string
      status?: number
      gameRebates?: { gameId: number; rebateRatePct: number }[]
    }
  ) => {
    return request(`/portal/agency/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  deleteAgent: async (id: number) => {
    return request(`/portal/agency/agents/${id}`, {
      method: 'DELETE'
    })
  },
  getPlayers: async (params?: { keyword?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/players${buildQuery(params)}`)
  },
  getAllPlayers: async (params?: { keyword?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/players/all${buildQuery(params)}`)
  },
  getOrders: async (params?: { keyword?: string; status?: string; gameId?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/orders${buildQuery(params)}`)
  },
  getAllOrders: async (params?: { keyword?: string; status?: string; gameId?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/orders/all${buildQuery(params)}`)
  },
  resetPlayerPassword: async (id: number, password: string) => {
    return request(`/portal/agency/players/${id}/password`, {
      method: 'POST',
      body: JSON.stringify({ password })
    })
  },
  updatePlayerInviteCode: async (id: number, inviteCode: string) => {
    return request(`/portal/agency/players/${id}/invite-code`, {
      method: 'PUT',
      body: JSON.stringify({ inviteCode })
    })
  },
  getBosses: async (params?: { page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/bosses${buildQuery(params)}`)
  },
  createBoss: async (data: any) => {
    return request('/portal/agency/bosses', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  updateBossGames: async (bossId: number, gameIds: number[]) => {
    return request(`/portal/agency/bosses/${bossId}/games`, {
      method: 'PUT',
      body: JSON.stringify({ gameIds })
    })
  },
  updateBoss: async (bossId: number, data: { username?: string; phone?: string; password?: string; status?: number }) => {
    return request(`/portal/agency/bosses/${bossId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  getBossOverview: async () => {
    return request('/portal/agency/boss/overview')
  },
  getBossFlows: async (params?: { gameId?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/boss/flows${buildQuery(params)}`)
  },
  getBossOrders: async (params?: { keyword?: string; status?: string; gameId?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/boss/orders${buildQuery(params)}`)
  },
  getSuperRebates: async () => {
    return request<{ gameId: number; gameName?: string; rebateRatePct: number }[]>('/portal/agency/super/rebates')
  },
  updateSuperRebates: async (gameRebates: { gameId: number; rebateRatePct: number }[]) => {
    return request('/portal/agency/super/rebates', {
      method: 'PUT',
      body: JSON.stringify({ gameRebates })
    })
  },
  getPerformance: async (params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }) => {
    return request(`/portal/agency/performance${buildQuery(params)}`)
  },
  getPerformanceOverview: async () => {
    return request('/portal/agency/performance/overview')
  },
  getPayoutAddress: async () => {
    return request<PayoutAddressData>('/portal/agency/payout-address')
  },
  uploadPayoutQRCode: async (channel: PayoutQRCodeChannel, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ url: string }>(`/portal/agency/payout-qrcode/upload${buildQuery({ channel })}`, {
      method: 'POST',
      body: formData
    })
  },
  savePayoutAddress: async (
    address: string,
    confirmAddress: string,
    loginPassword: string,
    alipayQrUrl?: string,
    wechatQrUrl?: string
  ) => {
    return request<PayoutAddressData>('/portal/agency/payout-address', {
      method: 'POST',
      body: JSON.stringify({ address, confirmAddress, loginPassword, alipayQrUrl, wechatQrUrl })
    })
  },
  getWithdraws: async (params?: { status?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/withdraws${buildQuery(params)}`)
  },
  createWithdraw: async (amount: string, method: 'usdt' | 'alipay' | 'wechat', remark?: string) => {
    return request('/portal/agency/withdraws', {
      method: 'POST',
      body: JSON.stringify({ amount, method, remark })
    })
  },
  getMyDeposits: async () => {
    return request<AgentGameDepositItem[]>('/portal/agency/deposits')
  },
  requestDepositRelease: async (gameId: number, remark?: string) => {
    return request(`/portal/agency/deposits/${gameId}/release-request`, {
      method: 'POST',
      body: JSON.stringify({ remark })
    })
  },
  getAgentDeposits: async (agentId: number) => {
    return request<AgentGameDepositItem[]>(`/portal/agency/agents/${agentId}/deposits`)
  },
  updateAgentDeposit: async (agentId: number, gameId: number, data: { enabled: boolean; amount: string; remark?: string }) => {
    return request(`/portal/agency/agents/${agentId}/deposits/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  getGameOrder: async () => {
    return request(`/portal/agency/game-order`)
  },
  updateGameOrder: async (gameIds: number[]) => {
    return request('/portal/agency/game-order', {
      method: 'PUT',
      body: JSON.stringify({ gameIds })
    })
  },
  getApprovals: async (params?: { status?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/approvals${buildQuery(params)}`)
  },
  updateApproval: async (id: number, status: string, remark?: string) => {
    return request(`/portal/agency/approvals/${id}`, {
      method: 'POST',
      body: JSON.stringify({ status, remark })
    })
  },
  getDepositReleaseRequests: async (params?: { status?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<DepositReleaseRequestItem>>(`/portal/agency/deposit-release-requests${buildQuery(params)}`)
  },
  updateDepositReleaseRequest: async (id: number, status: 'approved' | 'rejected', remark?: string) => {
    return request(`/portal/agency/deposit-release-requests/${id}`, {
      method: 'POST',
      body: JSON.stringify({ status, remark })
    })
  }
}
