import { request } from '../http'

export const userApi = {
  updateTheme: async (theme: string): Promise<void> => {
    await request('/portal/user/theme', {
      method: 'PUT',
      body: JSON.stringify({ theme })
    })
  },
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await request('/portal/user/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword })
    })
  }
}
