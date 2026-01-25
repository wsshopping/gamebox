
import { request } from '../http'

type PageResult<T> = {
  list: T[]
  total: number
  page: number
  pageSize: number
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
  getOrders: async (params?: { keyword?: string; status?: string; gameId?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/orders${buildQuery(params)}`)
  },
  resetPlayerPassword: async (id: number, password: string) => {
    return request(`/portal/agency/players/${id}/password`, {
      method: 'POST',
      body: JSON.stringify({ password })
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
  getPerformance: async (params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }) => {
    return request(`/portal/agency/performance${buildQuery(params)}`)
  },
  getPerformanceOverview: async () => {
    return request('/portal/agency/performance/overview')
  },
  getPayoutAddress: async () => {
    return request('/portal/agency/payout-address')
  },
  savePayoutAddress: async (address: string) => {
    return request('/portal/agency/payout-address', {
      method: 'POST',
      body: JSON.stringify({ address })
    })
  },
  getWithdraws: async (params?: { status?: string; page?: number; pageSize?: number }) => {
    return request<PageResult<any>>(`/portal/agency/withdraws${buildQuery(params)}`)
  },
  createWithdraw: async (amount: string, remark?: string) => {
    return request('/portal/agency/withdraws', {
      method: 'POST',
      body: JSON.stringify({ amount, remark })
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
  }
}
