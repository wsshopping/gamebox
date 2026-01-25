import { request } from '../http'
import { Game } from '../../types'
import { normalizeGame } from './game'

type PortalSearchResponse = {
  games: any[]
  items: any[]
}

export const searchApi = {
  query: async (term: string, page = 1, pageSize = 10): Promise<{ games: Game[]; items: any[] }> => {
    const params = new URLSearchParams()
    params.set('keyword', term)
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    const data = await request<PortalSearchResponse>(`/portal/search?${params.toString()}`)
    const games = Array.isArray(data.games) ? data.games.map(normalizeGame) : []
    return { games, items: [] }
  }
}
