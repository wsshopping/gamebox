export interface User {
  id: string;
  username: string;
  phone: string;
  avatar: string;
  vipLevel: number;
  assets: number;
  token: string;
}

const STORAGE_KEY = 'gamebox_users';
const SESSION_KEY = 'gamebox_current_user';

// Helper to delay response to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Login
  async login(account: string, password: string): Promise<User> {
    await delay(800); // Simulate network latency

    const usersStr = localStorage.getItem(STORAGE_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];
    
    // Simple check: simulate finding user by phone or username
    const user = users.find((u: any) => (u.username === account || u.phone === account) && u.password === password);

    if (user) {
      // Create a session user object (exclude password)
      const { password, ...safeUser } = user;
      const sessionUser = { ...safeUser, token: 'mock-jwt-token-' + Date.now() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    }

    throw new Error('账号或密码错误');
  },

  // Register
  async register(username: string, phone: string, password: string): Promise<User> {
    await delay(1000);

    const usersStr = localStorage.getItem(STORAGE_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];

    // Check duplicate
    if (users.some((u: any) => u.username === username)) {
      throw new Error('用户名已被注册');
    }
    if (users.some((u: any) => u.phone === phone)) {
      throw new Error('手机号已被注册');
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      phone,
      password, // In real app, never store plain text password!
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      vipLevel: 0,
      assets: 0
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    // Auto login after register
    const { password: _, ...safeUser } = newUser;
    const sessionUser = { ...safeUser, token: 'mock-jwt-token-' + Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    
    return sessionUser;
  },

  // Logout
  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(SESSION_KEY);
  },

  // Get current session
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(SESSION_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};