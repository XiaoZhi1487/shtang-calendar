import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE } from '../config/api';
import { useAppStore } from './useAppStore';

const APP_VERSION = '1.0.6';

// 本地保存的账号列表
interface SavedAccount {
  phone: string;
  lastLogin: number;
}
const SAVED_ACCOUNTS_KEY = 'shtang-saved-accounts';

function saveAccountToLocal(phone: string) {
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    const accounts: SavedAccount[] = raw ? JSON.parse(raw) : [];
    const existing = accounts.find(a => a.phone === phone);
    if (existing) {
      existing.lastLogin = Date.now();
    } else {
      accounts.push({ phone, lastLogin: Date.now() });
    }
    accounts.sort((a, b) => b.lastLogin - a.lastLogin);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

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
            const token = data.token;
            set({
              user: { id: data.userId.toString(), phone: data.phone },
              token,
              isLoggedIn: true,
            });
            // 保存账号到本地
            saveAccountToLocal(phone);
            // 登录成功后：从云端拉取数据，切换到云端数据源
            setTimeout(() => {
              const appStore = useAppStore.getState();
              appStore.loadFromCloud(token);
            }, 50);
            return { success: true };
          }
          return { success: false, error: data.error || '手机号或密码错误' };
        } catch (error: any) {
          console.error('登录失败:', error);
          return { success: false, error: '网络错误，请检查网络连接' };
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
            const token = data.token;
            set({
              user: { id: data.userId.toString(), phone: data.phone },
              token,
              isLoggedIn: true,
            });
            // 保存账号到本地
            saveAccountToLocal(phone);
            // 注册成功：新账号云端是空的，切换到云端模式
            setTimeout(() => {
              const appStore = useAppStore.getState();
              appStore.setUseCloud(true);
            }, 50);
            return { success: true };
          }
          return { success: false, error: data.error || '注册失败' };
        } catch (error: any) {
          console.error('注册失败:', error);
          return { success: false, error: '网络错误，请检查网络连接' };
        }
      },

      // 退出登录：清除登录态，并将数据切换回本地
      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
        // 切换回本地数据源
        setTimeout(() => {
          const appStore = useAppStore.getState();
          appStore.setUseCloud(false);
        }, 50);
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
      // 重新初始化时（刷新页面），根据持久化的 isLoggedIn 决定是否恢复云端数据
      onRehydrateStorage: () => (state) => {
        if (state && state.isLoggedIn && state.token) {
          // 已登录：重新从云端拉取
          const token = state.token;
          setTimeout(() => {
            try {
              const appStore = useAppStore.getState();
              // 先尝试从云端加载；失败则使用之前持久化的 cloudAccounts（因为 useAppStore 已经持久化了）
              appStore.loadFromCloud(token).catch(() => {
                appStore.setUseCloud(true);
              });
            } catch {}
          }, 100);
        } else {
          // 未登录：切换到本地数据源
          setTimeout(() => {
            try {
              const appStore = useAppStore.getState();
              appStore.setUseCloud(false);
            } catch {}
          }, 100);
        }
      },
    }
  )
);
