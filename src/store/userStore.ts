import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE } from '../config/api';
import { useAppStore } from './useAppStore';

const APP_VERSION = '1.0.0';

interface UserState {
  user: { id: string; phone: string } | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAppVersion: () => string;
  checkUpdate: () => Promise<{ hasUpdate: boolean; version?: string; releaseNote?: string; downloadUrl?: string }>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      // --- 登录 ---
      login: async (phone, password) => {
        try {
          const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
          });
          if (!res.ok) {
            const data = await res.json();
            return { success: false, error: data.error || '手机号或密码错误' };
          }
          const data = await res.json();
          if (!data.success) {
            return { success: false, error: data.error || '登录失败' };
          }

          // 写入用户状态
          set({
            user: { id: String(data.userId), phone: data.phone },
            token: data.token,
          });
          console.log('[userStore] 登录成功 userId:', data.userId);

          // 登录成功后从 MySQL 拉取该用户的记账数据
          await useAppStore.getState().refreshAccounts();
          return { success: true };
        } catch (e) {
          console.error('[userStore] 登录异常:', e);
          return { success: false, error: '网络错误' };
        }
      },

      // --- 注册 ---
      register: async (phone, password) => {
        try {
          const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
          });
          if (!res.ok) {
            const data = await res.json();
            return { success: false, error: data.error || '注册失败' };
          }
          const data = await res.json();
          if (!data.success) {
            return { success: false, error: data.error || '注册失败' };
          }
          set({
            user: { id: String(data.userId), phone: data.phone },
            token: data.token,
          });
          console.log('[userStore] 注册成功 userId:', data.userId);
          // 新用户云端无数据，直接刷新
          await useAppStore.getState().refreshAccounts();
          return { success: true };
        } catch (e) {
          console.error('[userStore] 注册异常:', e);
          return { success: false, error: '网络错误' };
        }
      },

      // --- 登出 ---
      logout: () => {
        set({ user: null, token: null });
        console.log('[userStore] 已登出');
        // 清空云端数据，切换回本地数据
        useAppStore.getState().clearCloudAccounts();
      },

      // --- 应用版本 ---
      getAppVersion: () => APP_VERSION,
      checkUpdate: async () => {
        try {
          const res = await fetch(`${API_BASE}/version/latest`);
          if (!res.ok) return { hasUpdate: false };
          const data = await res.json();
          if (data.version && data.version !== APP_VERSION) {
            return {
              hasUpdate: true,
              version: data.version,
              releaseNote: data.releaseNote,
              downloadUrl: data.downloadUrl,
            };
          }
          return { hasUpdate: false, version: data.version };
        } catch {
          return { hasUpdate: false };
        }
      },
    }),
    {
      name: 'user-storage',
      // 重新初始化后（如刷新页面）：若之前已登录，则从 MySQL 拉回数据
      onRehydrateStorage: () => (state) => {
        if (state && state.token) {
          setTimeout(() => {
            useAppStore.getState().refreshAccounts();
          }, 100);
        }
      },
    }
  )
);
