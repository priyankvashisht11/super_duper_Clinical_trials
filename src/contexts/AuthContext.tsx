import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService, { type User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title?: string;
  specialty?: string;
  institution?: string;
  licenseNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth state lives in httpOnly cookies the browser manages for us — there's no token
  // for this code to hold. `auth_user` in localStorage is just a cached display copy
  // (name/role etc., not a credential) so the UI can render instantly before the
  // network round-trip below confirms (or clears) it.
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch { /* ignore corrupt cache */ }
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem('auth_user', JSON.stringify(currentUser));
      } catch (error) {
        // No valid session cookie (or it expired) — clear cached state.
        localStorage.removeItem('auth_user');
        setUser(null);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await authService.login(email, password, rememberMe);
    setUser(response.user);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  };

  const register = async (data: RegisterData) => {
    const response = await authService.register(data);
    setUser(response.user);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_user');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
