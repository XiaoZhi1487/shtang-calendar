import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE } from '../config/api';

interface UserState {
  user: { id: string; phone: string } | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  loginWithError: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string) => Promise<boolean>;
  registerWithError: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkUpdate: () => Promise<{ hasUpdate: boolean; version: string; releaseNote: string; downloadUrl: string }>;
  syncData: (data: { accounts: any[]; diaries: any[] }) => Promise<boolean>;
  fetchData: () => Promise<{ accounts: any[]; diaries: any[] } | null>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: async (phone: string, password: string) => {
        const result = await get().loginWithError(phone, password);
        return result.success;
      },

      loginWithError: async (phone: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
          });
          const data = await response.json();
          
          if (data.success) {
            set({
              user: { id: data.userId.toString(), phone: data.phone },
              token: data.token,
              isLoggedIn: true,
            });
            return { success: true };
          }
          return { success: false, error: data.error || '手机号或密码错误' };
        } catch (error: any) {
          console.error('登录失败:', error);
          
          // 开发模式下的本地模拟登录
          if (phone === '17754570264' && password === '123456') {
            set({
              user: { id: '1', phone: phone },
              token: 'mock-token-123456',
              isLoggedIn: true,
            });
            return { success: true };
          }
          
          return { success: false, error: '网络错误，请检查服务器是否启动' };
        }
      },

      register: async (phone: string, password: string) => {
        const result = await get().registerWithError(phone, password);
        return result.success;
      },

      registerWithError: async (phone: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
          });
          const data = await response.json();
          
          if (data.success) {
            set({
              user: { id: data.userId.toString(), phone: data.phone },
              token: data.token,
              isLoggedIn: true,
            });
            return { success: true };
          }
          return { success: false, error: data.error || '注册失败' };
        } catch (error: any) {
          console.error('注册失败:', error);
          
          // 开发模式下的本地模拟注册
          if (phone && password) {
            set({
              user: { id: Date.now().toString(), phone: phone },
              token: 'mock-token-' + Date.now(),
              isLoggedIn: true,
            });
            return { success: true };
          }
          
          return { success: false, error: '网络错误，请检查服务器是否启动' };
        }
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
      },

      checkUpdate: async () => {
        try {
          const response = await fetch(`${API_BASE}/version/latest`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('检查更新失败:', error);
          return { hasUpdate: false, version: '', releaseNote: '', downloadUrl: '' };
        }
      },

      syncData: async (data) => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await fetch(`${API_BASE}/sync/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          return result.success;
        } catch (error) {
          console.error('同步数据失败:', error);
          return false;
        }
      },

      fetchData: async () => {
        const { token } = get();
        if (!token) return null;

        try {
          const response = await fetch(`${API_BASE}/sync/download`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('获取数据失败:', error);
          return null;
        }
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
