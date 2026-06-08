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

interface AppState {
  // Account Book
  accounts: AccountEntry[];
  addAccount: (entry: Omit<AccountEntry, 'id'>) => void;
  deleteAccount: (id: string) => void;

  // Diary
  diaries: DiaryEntry[];
  saveDiary: (entry: DiaryEntry) => void;

  // Data sync
  syncToCloud: (token: string) => Promise<boolean>;
  loadFromCloud: (token: string) => Promise<boolean>;
  clearAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      addAccount: (entry) =>
        set((state) => ({
          accounts: [...state.accounts, { ...entry, id: Date.now().toString() }],
        })),
      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),

      diaries: [],
      saveDiary: (entry) =>
        set((state) => {
          const existing = state.diaries.findIndex((d) => d.date === entry.date);
          if (existing >= 0) {
            const updated = [...state.diaries];
            updated[existing] = entry;
            return { diaries: updated };
          }
          return { diaries: [...state.diaries, entry] };
        }),

      // 同步数据到云端
      syncToCloud: async (token: string) => {
        try {
          const { accounts, diaries } = get();
          const response = await fetch(`${API_BASE}/sync/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ accounts, diaries }),
          });
          const result = await response.json();
          return result.success;
        } catch (error) {
          console.error('同步到云端失败:', error);
          return false;
        }
      },

      // 从云端加载数据
      loadFromCloud: async (token: string) => {
        try {
          const response = await fetch(`${API_BASE}/sync/download`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data && data.accounts && data.diaries) {
            set({ accounts: data.accounts, diaries: data.diaries });
            return true;
          }
          return false;
        } catch (error) {
          console.error('从云端加载失败:', error);
          return false;
        }
      },

      // 清空所有数据
      clearAll: () => {
        set({ accounts: [], diaries: [] });
      }
    }),
    {
      name: 'app-storage',
    }
  )
);
