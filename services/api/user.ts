import { request } from '../http'

export const userApi = {
  updateTheme: async (theme: string): Promise<void> => {
    await request('/portal/user/theme', {
      method: 'PUT',
      body: JSON.stringify({ theme })
    })
  }
}
