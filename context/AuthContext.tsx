import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authService } from '../services/auth';
import { authStorage } from '../services/http';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string, captcha: string, captchaId: string) => Promise<void>;
  register: (username: string, phone: string, password: string, secondPassword: string, inviteCode: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check login status on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string, captcha: string, captchaId: string) => {
    setIsLoading(true);
    try {
      const user = await authService.login(phone, password, captcha, captchaId);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, phone: string, password: string, secondPassword: string, inviteCode: string) => {
    setIsLoading(true);
    try {
      const user = await authService.register(username, phone, password, secondPassword, inviteCode);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (patch: Partial<User>) => {
    setUser(prev => {
      if (!prev) {
        return prev;
      }
      const next = { ...prev, ...patch };
      authStorage.setUser(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
