import { authStorage, request } from '../http'
import { Game } from '../../types'

type PageResult<T> = {
  list: T[]
  total: number
  page: number
  pageSize: number
}

type PortalGameItem = {
  id: number
  name: string
  subtitle?: string
  description?: string
  categoryId?: number
  categoryName?: string
  tags?: string[] | string
  iconUrl?: string
  bannerUrl?: string
  galleryUrls?: string[]
  downloadUrl?: string
  packageSize?: string
  version?: string
  developer?: string
  rating?: number
  downloads?: number
  isReserve?: number
}

type PortalGameReserveStatus = {
  reserved: boolean
  total: number
}

const formatDownloads = (value?: number): string => {
  const downloads = value || 0
  if (downloads >= 100000000) {
    return `${(downloads / 100000000).toFixed(1)}亿`
  }
  if (downloads >= 10000) {
    return `${(downloads / 10000).toFixed(1)}万`
  }
  return `${downloads}`
}

const normalizeTags = (tags?: string[] | string): string[] => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  return tags
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const normalizeGame = (game: PortalGameItem): Game => ({
  id: String(game.id),
  title: game.name,
  category: game.categoryName || '',
  icon: game.iconUrl || '',
  rating: game.rating || 0,
  downloads: formatDownloads(game.downloads),
  tags: normalizeTags(game.tags),
  description: game.description,
  intro: game.description,
  images: game.galleryUrls || [],
  banner: game.bannerUrl || '',
  downloadUrl: game.downloadUrl,
  size: game.packageSize,
  version: game.version,
  developer: game.developer,
  isReserve: game.isReserve === 1
})

export const gameApi = {
  getList: async (filter?: string, page = 1, pageSize = 10): Promise<Game[]> => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    if (filter && filter !== 'all') {
      params.set('type', filter)
    }
    const data = await request<PageResult<PortalGameItem>>(`/portal/game/list?${params.toString()}`)
    return data.list.map(normalizeGame)
  },
  getById: async (id: string): Promise<Game | undefined> => {
    const data = await request<PortalGameItem>(`/portal/game/${id}`)
    return data ? normalizeGame(data) : undefined
  },
  getReserveStatus: async (id: string): Promise<PortalGameReserveStatus> => {
    const data = await request<PortalGameReserveStatus>(`/portal/game/${id}/reserve-status`, {
      skipAuth: !authStorage.getToken()
    })
    return {
      reserved: Boolean(data?.reserved),
      total: Number(data?.total || 0)
    }
  },
  reserve: async (id: string): Promise<PortalGameReserveStatus> => {
    const data = await request<PortalGameReserveStatus>(`/portal/game/${id}/reserve`, {
      method: 'POST'
    })
    return {
      reserved: Boolean(data?.reserved),
      total: Number(data?.total || 0)
    }
  },
  getHot: async (): Promise<Game[]> => {
    const data = await request<PortalGameItem[]>(`/portal/game/hot?limit=3`)
    return data.map(normalizeGame)
  },
  getRankings: async (type: 'hot' | 'new' | 'soaring'): Promise<Game[]> => {
    const data = await request<PortalGameItem[]>(`/portal/game/rank?type=${type}`)
    return data.map(normalizeGame)
  }
}
