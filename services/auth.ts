import { authStorage, request } from './http'

export interface User {
  ID: number
  uuid: string
  username: string
  phone: string
  roleId: number
  referrerAgentId?: number
  avatar?: string
  theme?: string
  vipLevel?: number
  assets?: number
  status?: number
  role?: RoleInfo
  inviteCode?: string
}

export interface RoleInfo {
  id: number
  name: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresAt: number
  role: RoleInfo
  inviteCode?: string
}

export interface CaptchaResponse {
  captchaId: string
  picPath: string
  captchaLength: number
  openCaptcha: boolean
}

export const authService = {
  async login(phone: string, password: string, captcha: string, captchaId: string): Promise<User> {
    const data = await request<LoginResponse>('/portal/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password, captcha, captchaId }),
      skipAuth: true
    })

    authStorage.setToken(data.token)
    const userWithRole = { ...data.user, role: data.role, inviteCode: data.inviteCode }
    authStorage.setUser(userWithRole)
    return userWithRole
  },

  async register(username: string, phone: string, password: string, secondPassword: string, inviteCode: string): Promise<User> {
    const data = await request<LoginResponse>('/portal/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, phone, password, secondPassword, inviteCode }),
      skipAuth: true
    })

    authStorage.setToken(data.token)
    const userWithRole = { ...data.user, role: data.role, inviteCode: data.inviteCode }
    authStorage.setUser(userWithRole)
    return userWithRole
  },

  async logout(): Promise<void> {
    authStorage.clearToken()
    authStorage.clearUser()
  },

  getCurrentUser(): User | null {
    return authStorage.getUser()
  },

  async getCaptcha(): Promise<CaptchaResponse> {
    return request<CaptchaResponse>('/base/captcha', {
      method: 'POST',
      skipAuth: true
    })
  }
}
