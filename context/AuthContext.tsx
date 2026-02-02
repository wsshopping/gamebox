
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (account: string, password: string) => Promise<void>;
  register: (username: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateStatus: (status: 'online' | 'busy' | 'away' | 'offline') => Promise<void>;
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

  const login = async (account: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.login(account, password);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.register(username, phone, password);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateStatus = async (status: 'online' | 'busy' | 'away' | 'offline') => {
    try {
        const updatedUser = await authService.updateStatus(status);
        setUser(updatedUser);
    } catch (e) {
        console.error("Failed to update status", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateStatus }}>
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
