
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

export type PortalMaintenanceStatus = {
  agentEnabled: boolean
  playerEnabled: boolean
  forceLogout: boolean
}

export type PortalMonthlySettlementConfig = {
  enabled: boolean
  reminderEnabled: boolean
  archiveEnabled: boolean
  reminderStartDay: number
  archiveRunAt: string
}

export type AgentMonthlySettlementSummary = {
  monthKey: string
  totalFlow: string
  totalProfit: string
  withdrawn: string
  withdrawable: string
  pendingSettlement: string
  lockedWithdraw: string
}

export type AgentMonthlyBalanceSummary = {
  monthKey: string
  openingBalance: string
  openingDepositLocked: string
  openingDepositDeficit: string
  currentDepositLocked: string
  depositDelta: string
  withdrawableBalance: string
  depositDeficit: string
}

export type AgentMonthlyArchiveSummary = {
  monthKey: string
  totalFlow: string
  totalProfit: string
  withdrawn: string
  lockedWithdraw: string
  unwithdrawn: string
  closingBalance: string
  depositLockedSnapshot: string
  depositDeficitSnapshot: string
  depositDelta: string
  snapshotAt: string
}

export type AgentMonthlySettlementStatus = {
  enabled: boolean
  reminderEnabled: boolean
  archiveEnabled: boolean
  reminderStartDay: number
  archiveRunAt: string
  reminderActive: boolean
  reminderMessage: string
  currentMonth: string
  currentSummary: AgentMonthlySettlementSummary
  balanceSummary: AgentMonthlyBalanceSummary
  lastMonth?: AgentMonthlyArchiveSummary
}

export type BannedAgentSummary = {
  bannedCount: number
  todayPerformance: string
  totalPerformance: string
  sensitiveMasked?: boolean
}

export type BannedAgentItem = {
  id: number
  account: string
  inviteCode: string
  bannedAt: string
  todayPerformance: string
  totalPerformance: string
  sensitiveMasked?: boolean
}

export type BannedAgentListResponse = {
  summary: BannedAgentSummary
  list: BannedAgentItem[]
  total: number
  page: number
  pageSize: number
}

export type OrderSummaryMetric = {
  totalAmount: string
  orderCount: number
}

export type PerformanceOverviewStat = {
  totalAmount: string
  orderCount: number
  totalProfit: string
}

export type PerformanceOverviewCard = {
  key: string
  label: string
  date?: string
  totalAmount: string
  orderCount: number
  totalProfit: string
  details: {
    gameId: string
    gameName: string
    entries: {
      inviteCode: string
      amount: string
      diffRatePct: number
      profit: string
    }[]
  }[]
}

export type PerformanceOverviewAgent = {
  inviteCode: string
  nickname: string
  role?: string
  downlineCount: number
  today: PerformanceOverviewStat
  yesterday: PerformanceOverviewStat
  dayBefore: PerformanceOverviewStat
  total: PerformanceOverviewStat
}

export type PerformanceOverviewGame = {
  gameId: string
  gameName: string
  ratePct: number
  rateSource: string
  today: PerformanceOverviewStat
  yesterday: PerformanceOverviewStat
  dayBefore: PerformanceOverviewStat
  total: PerformanceOverviewStat
}

export type PerformanceOverviewResponse = {
  cards: PerformanceOverviewCard[]
  agents: PerformanceOverviewAgent[]
  games: PerformanceOverviewGame[]
}

export type OrderListSummary = {
  today: OrderSummaryMetric
  yesterday: OrderSummaryMetric
  total: OrderSummaryMetric
}

export type OrderListResponse = {
  summary: OrderListSummary
  list: any[]
  total: number
  page: number
  pageSize: number
}

export type DepositBatchAgentItem = {
  agentHierarchyId: number
  agentAccount: string
  remarkName: string
  inviteCode: string
  roleId?: number
  role: string
  gameId: number
  gameName: string
  amount: string
  status: string
  updatedAt: string
}

export type DepositBatchApplyFailure = {
  agentHierarchyId: number
  agentAccount: string
  reason: string
}

export type DepositBatchApplyResult = {
  matchedCount: number
  successCount: number
  failedCount: number
  failures: DepositBatchApplyFailure[]
}

export type AgentPermissionBatchItem = {
  agentHierarchyId: number
  agentAccount: string
  remarkName: string
  inviteCode: string
  roleId?: number
  role: string
  gameId: number
  gameName: string
  todayRegisterCount: number
  totalRegisterCount: number
  canCreateChildAgents: boolean
}

export type AgentPermissionBatchUpdateResult = {
  matchedCount: number
  updatedCount: number
  skippedCount: number
}

export type AgencyStatsData = {
  role: string
  code: string
  creatable?: string
  canCreateChildAgents?: boolean
  registerCount?: number
  totalFlow?: string
  totalProfit?: string
  settledProfit?: string
  pendingSettlement?: string
  withdrawn?: string
  lockedWithdraw?: string
  withdrawable?: string
  depositLocked?: string
  depositDeficit?: string
  sensitiveMasked?: boolean
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
  resetSuper2FAEntry: async () => {
    return request('/portal/agency/super/2fa/reset', {
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
  getPortalMaintenanceStatus: async () => {
    return request<PortalMaintenanceStatus>('/portal/agency/super/maintenance')
  },
  updatePortalMaintenanceStatus: async (data: PortalMaintenanceStatus) => {
    return request<PortalMaintenanceStatus>('/portal/agency/super/maintenance', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  getPortalMonthlySettlementConfig: async () => {
    return request<PortalMonthlySettlementConfig>('/portal/agency/super/monthly-settlement')
  },
  updatePortalMonthlySettlementConfig: async (data: {
    enabled: boolean
    reminderEnabled: boolean
    archiveEnabled: boolean
    reminderStartDay: number
  }) => {
    return request<PortalMonthlySettlementConfig>('/portal/agency/super/monthly-settlement', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  getAgentMonthlySettlementStatus: async () => {
    return request<AgentMonthlySettlementStatus>('/portal/agency/monthly-settlement')
  },
  getStats: async () => {
    return request<AgencyStatsData>('/portal/agency/stats')
  },
  getAgents: async (params?: { scope?: string; roleId?: number; gameId?: number; keyword?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/agents${buildQuery(params)}`)
  },
  getBannedAgents: async (params?: { gameId?: number; statDate?: string; page?: number; pageSize?: number }) => {
    return request<BannedAgentListResponse>(`/portal/agency/super/banned-agents${buildQuery(params)}`)
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
      canCreateChildAgents?: boolean
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
    return request<OrderListResponse>(`/portal/agency/orders${buildQuery(params)}`)
  },
  getAllOrders: async (params?: { keyword?: string; status?: string; gameId?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number }) => {
    return request<OrderListResponse>(`/portal/agency/orders/all${buildQuery(params)}`)
  },
  resetPlayerPassword: async (id: number, password: string) => {
    return request(`/portal/agency/players/${id}/password`, {
      method: 'POST',
      body: JSON.stringify({ password })
    })
  },
  resetPlayerChainPassword: async (id: number, password: string) => {
    return request<{ playerId: number; updatedCount: number; accounts: string[] }>(`/portal/agency/players/${id}/password/chain`, {
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
  getBossAgents: async (params?: { roleId?: number; keyword?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/boss/agents${buildQuery(params)}`)
  },
  getBossPlayers: async (params?: { keyword?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/boss/players${buildQuery(params)}`)
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
    return request<PerformanceOverviewResponse>('/portal/agency/performance/overview')
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
  getDepositBatchAgents: async (params?: { gameId?: number; roleId?: number; keyword?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<DepositBatchAgentItem>>(`/portal/agency/deposits/batch-agents${buildQuery(params)}`)
  },
  batchApplyAgentDeposit: async (data: { gameId: number; roleId?: number; keyword?: string; amount: string; remark?: string }) => {
    return request<DepositBatchApplyResult>('/portal/agency/deposits/batch-apply', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  getAgentPermissionBatchAgents: async (params?: { gameId?: number; roleId?: number; keyword?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<AgentPermissionBatchItem>>(`/portal/agency/super/agent-permission-zone${buildQuery(params)}`)
  },
  batchDisableAgentPermission: async (data: { gameId?: number; roleId?: number; keyword?: string }) => {
    return request<AgentPermissionBatchUpdateResult>('/portal/agency/super/agent-permission-zone/disable', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  batchEnableAgentPermission: async (data: { gameId?: number; roleId?: number; keyword?: string }) => {
    return request<AgentPermissionBatchUpdateResult>('/portal/agency/super/agent-permission-zone/enable', {
      method: 'POST',
      body: JSON.stringify(data)
    })
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
  getApprovals: async (params?: { keyword?: string; status?: string; method?: string; page?: number; pageSize?: number }) => {
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
