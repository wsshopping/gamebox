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
  },
  updateAvatar: async (avatar: string): Promise<User> => {
    return request<User>('/portal/user/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar })
    })
  },
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ url: string }>('/portal/user/avatar/upload', {
      method: 'POST',
      body: formData
    })
  }
}
