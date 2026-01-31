const API_BASE = import.meta.env.VITE_BASE_API || '/api/v1'
const TOKEN_KEY = 'portal_token'
const USER_KEY = 'portal_user'
let authRedirected = false

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY) || '',
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },
  setUser: (user: any) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(USER_KEY)
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = authStorage.getToken()
  const user = authStorage.getUser()

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {})
  }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (!options.skipAuth && token) {
    headers['x-token'] = token
  }
  if (!options.skipAuth && user?.ID) {
    headers['x-user-id'] = String(user.ID)
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  })

  const newToken = res.headers.get('new-token')
  if (newToken) {
    authStorage.setToken(newToken)
  }

  let data: any = null
  try {
    data = await res.json()
  } catch (e) {
    // ignore json parse errors
  }

  if (!res.ok) {
    if (res.status === 401 && !authRedirected) {
      authRedirected = true
      authStorage.clearToken()
      authStorage.clearUser()
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || ''
        if (!hash.startsWith('#/login')) {
          window.alert(data?.msg || '登录已失效，请重新登录')
          window.location.hash = '#/login'
        }
      }
    }
    throw new Error(data?.msg || res.statusText || '请求失败')
  }

  if (data && typeof data.code !== 'undefined') {
    if (data.code !== 0) {
      throw new Error(data.msg || '请求失败')
    }
    return data.data as T
  }

  return data as T
}
