import { request } from '../http'
import type { User } from '../auth'

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
  },
  updateUsername: async (username: string): Promise<User> => {
    return request<User>('/portal/user/username', {
      method: 'PUT',
      body: JSON.stringify({ username })
    })
  }
}
