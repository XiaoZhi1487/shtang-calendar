import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE } from '../config/api';

export interface AccountEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subCategory?: string;
  quantity?: number;
  unit?: string;
  note?: string;
  date: string;
}

export interface DiaryEntry {
  date: string;
  content: string;
}

// ============ 前后端字段转换 ============
const toCloudAccount = (entry: AccountEntry) => ({
  type: entry.type,
  category: entry.category,
  subCategory: entry.subCategory || null,
  amount: entry.amount,
  unit: entry.unit || null,
  quantity: entry.quantity || null,
  note: entry.note || null,
  recordDate: entry.date,
});

const fromCloudAccount = (item: any): AccountEntry => ({
  id: String(item.id || `${Date.now()}-${Math.floor(Math.random() * 10000)}`),
  type: item.type,
  amount: Number(item.amount),
  category: item.category,
  subCategory: item.subCategory || undefined,
  quantity: item.quantity != null ? Number(item.quantity) : undefined,
  unit: item.unit || undefined,
  note: item.note || undefined,
  date: item.recordDate || item.date,
});

const toCloudDiary = (entry: DiaryEntry) => ({
  recordDate: entry.date,
  content: entry.content,
});

const fromCloudDiary = (item: any): DiaryEntry => ({
  date: item.recordDate || item.date,
  content: item.content,
});

interface AppState {
  // ====== 本地数据（未登录时使用，持久化到 localStorage） ======
  localAccounts: AccountEntry[];
  localDiaries: DiaryEntry[];

  // ====== 云端数据（登录后使用，也持久化以支持离线查看） ======
  cloudAccounts: AccountEntry[];
  cloudDiaries: DiaryEntry[];

  // ====== 当前活跃数据源标识 ======
  useCloud: boolean;

  // ====== 当前视图下的账目与日记（由 useCloud 决定，组件直接读取） ======
  accounts: AccountEntry[];
  diaries: DiaryEntry[];

  // ====== Actions ======
  addAccount: (entry: Omit<AccountEntry, 'id'>) => void;
  deleteAccount: (id: string) => void;
  saveDiary: (entry: DiaryEntry) => void;

  setUseCloud: (useCloud: boolean) => void;

  syncToCloud: (token: string) => Promise<boolean>;
  loadFromCloud: (token: string) => Promise<boolean>;

  clearAll: () => void;
}

function computeActiveState(state: Partial<AppState>) {
  const useCloud = state.useCloud ?? false;
  return {
    accounts: useCloud ? state.cloudAccounts ?? [] : state.localAccounts ?? [],
    diaries: useCloud ? state.cloudDiaries ?? [] : state.localDiaries ?? [],
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      localAccounts: [],
      localDiaries: [],
      cloudAccounts: [],
      cloudDiaries: [],
      useCloud: false,
      accounts: [],
      diaries: [],

      addAccount: (entry) => {
        const newEntry: AccountEntry = {
          ...entry,
          id: Date.now().toString() + Math.floor(Math.random() * 1000),
        };
        const { useCloud } = get();

        set((state) => {
          if (useCloud) {
            const cloudAccounts = [...state.cloudAccounts, newEntry];
            return {
              cloudAccounts,
              accounts: cloudAccounts,
            };
          } else {
            const localAccounts = [...state.localAccounts, newEntry];
            return {
              localAccounts,
              accounts: localAccounts,
            };
          }
        });

        // 云端模式下自动同步
        if (useCloud) {
          const token = getTokenFromStorage();
          if (token) {
            get().syncToCloud(token);
          }
        }
      },

      deleteAccount: (id) => {
        const { useCloud } = get();

        set((state) => {
          if (useCloud) {
            const cloudAccounts = state.cloudAccounts.filter((a) => a.id !== id);
            return {
              cloudAccounts,
              accounts: cloudAccounts,
            };
          } else {
            const localAccounts = state.localAccounts.filter((a) => a.id !== id);
            return {
              localAccounts,
              accounts: localAccounts,
            };
          }
        });

        if (useCloud) {
          const token = getTokenFromStorage();
          if (token) {
            get().syncToCloud(token);
          }
        }
      },

      saveDiary: (entry) => {
        const { useCloud } = get();

        set((state) => {
          if (useCloud) {
            const existing = state.cloudDiaries.findIndex((d) => d.date === entry.date);
            let cloudDiaries: DiaryEntry[];
            if (existing >= 0) {
              cloudDiaries = [...state.cloudDiaries];
              cloudDiaries[existing] = entry;
            } else {
              cloudDiaries = [...state.cloudDiaries, entry];
            }
            return {
              cloudDiaries,
              diaries: cloudDiaries,
            };
          } else {
            const existing = state.localDiaries.findIndex((d) => d.date === entry.date);
            let localDiaries: DiaryEntry[];
            if (existing >= 0) {
              localDiaries = [...state.localDiaries];
              localDiaries[existing] = entry;
            } else {
              localDiaries = [...state.localDiaries, entry];
            }
            return {
              localDiaries,
              diaries: localDiaries,
            };
          }
        });

        if (useCloud) {
          const token = getTokenFromStorage();
          if (token) {
            get().syncToCloud(token);
          }
        }
      },

      setUseCloud: (useCloud) => {
        set((state) => {
          const next = computeActiveState({
            ...state,
            useCloud,
          });
          return { useCloud, accounts: next.accounts, diaries: next.diaries };
        });
      },

      syncToCloud: async (token: string) => {
        try {
          const { cloudAccounts, cloudDiaries } = get();
          const response = await fetch(`${API_BASE}/sync/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              accounts: cloudAccounts.map(toCloudAccount),
              diaries: cloudDiaries.map(toCloudDiary),
            }),
          });
          const result = await response.json();
          return !!result.success;
        } catch (error) {
          console.error('同步到云端失败:', error);
          return false;
        }
      },

      loadFromCloud: async (token: string) => {
        try {
          const response = await fetch(`${API_BASE}/sync/download`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data) {
            const accounts: AccountEntry[] = (data.accounts || []).map(fromCloudAccount);
            const diaries: DiaryEntry[] = (data.diaries || []).map(fromCloudDiary);
            set({
              cloudAccounts: accounts,
              cloudDiaries: diaries,
              useCloud: true,
              accounts: accounts,
              diaries: diaries,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('从云端加载失败:', error);
          return false;
        }
      },

      clearAll: () => {
        set({
          localAccounts: [],
          localDiaries: [],
          cloudAccounts: [],
          cloudDiaries: [],
          accounts: [],
          diaries: [],
          useCloud: false,
        });
      },
    }),
    {
      name: 'app-storage',
      // 持久化全部字段（包括云端缓存），这样登录后刷新也能看到数据
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 恢复后根据 useCloud 重新计算 active accounts/diaries
          const next = computeActiveState(state);
          state.accounts = next.accounts;
          state.diaries = next.diaries;
        }
      },
    }
  )
);

// 从 localStorage 获取 token（不依赖 userStore 以避免循环引用）
function getTokenFromStorage(): string | null {
  try {
    const raw = localStorage.getItem('user-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.state?.token || null;
  } catch {
    return null;
  }
}
