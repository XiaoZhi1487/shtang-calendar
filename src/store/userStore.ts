import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE } from '../config/api';

const APP_VERSION = '1.0.2';

interface UserState {
  user: { id: string; phone: string } | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkUpdate: () => Promise<{ hasUpdate: boolean; version: string; releaseNote: string; downloadUrl: string }>;
  getAppVersion: () => string;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: async (phone: string, password: string) => {
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

          // 本地模式登录（不依赖服务器）
          if (phone && password) {
            set({
              user: { id: 'local-' + Date.now().toString(), phone: phone },
              token: 'local-token',
              isLoggedIn: true,
            });
            return { success: true };
          }

          return { success: false, error: '网络错误，请检查服务器是否启动' };
        }
      },

      register: async (phone: string, password: string) => {
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

          // 本地模式注册
          if (phone && password) {
            set({
              user: { id: 'local-' + Date.now().toString(), phone: phone },
              token: 'local-token',
              isLoggedIn: true,
            });
            return { success: true };
          }

          return { success: false, error: '网络错误，请检查服务器是否启动' };
        }
      },

      // 只清除登录状态，不清除数据（数据保留在本地）
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

      getAppVersion: () => APP_VERSION,
    }),
    {
      name: 'user-storage',
    }
  )
);
