import { request } from '../http'
import { Banner } from '../../types'

type PortalBanner = {
  id?: number
  ID?: number
  title?: string
  imageUrl?: string
  image_url?: string
  linkUrl?: string
  link_url?: string
  position?: string
  sort?: number
  status?: number
}

export const bannerApi = {
  getHome: async (): Promise<Banner[]> => {
    const data = await request<PortalBanner[]>('/portal/banner/list?position=home&limit=5')
    return data.map((item) => ({
      id: item.id ?? item.ID ?? 0,
      title: item.title || '',
      imageUrl: item.imageUrl || item.image_url || '',
      linkUrl: item.linkUrl || item.link_url || ''
    }))
  }
}
