import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { API_BASE } from '../config/api';
import { useUserStore } from './userStore';

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

interface AppState {
  // 本地数据（未登录时使用，持久化到 localStorage）
  localAccounts: AccountEntry[];
  // 云端数据（登录后从 MySQL 拉取，不持久化）
  cloudAccounts: AccountEntry[];
  // 当前显示的数据（根据登录状态自动选择）
  accounts: AccountEntry[];
  // 操作
  addAccount: (entry: Omit<AccountEntry, 'id'>) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
  refreshAccounts: () => Promise<boolean>;
  clearCloudAccounts: () => void;
}

// ============ 工具：是否登录 ============
function hasToken(): string | null {
  return useUserStore.getState().token;
}

// ============ 工具：把任意日期格式转为 YYYY-MM-DD ============
function toDateString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return val;
  }
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(val);
  const isoMatch = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
  return s;
}

const fromDb = (item: any): AccountEntry => ({
  id: String(item.id),
  type: item.type,
  amount: Number(item.amount),
  category: item.category,
  subCategory: item.subCategory || undefined,
  quantity: item.quantity != null ? Number(item.quantity) : undefined,
  unit: item.unit || undefined,
  note: item.note || undefined,
  date: toDateString(item.recordDate || item.date),
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      localAccounts: [],
      cloudAccounts: [],
      accounts: [],

      // 清空云端数据（登出时调用）
      clearCloudAccounts: () => {
        set({ cloudAccounts: [], accounts: get().localAccounts });
        console.log('[清空云端数据] 已清空，切换到本地数据');
      },

      // 拉取数据（已登录 → MySQL；未登录 → 使用本地数据）
      refreshAccounts: async () => {
        const token = hasToken();
        if (!token) {
          // 未登录：使用本地数据
          const local = get().localAccounts;
          set({ accounts: local });
          console.log('[刷新] 未登录，使用本地数据，共', local.length, '条');
          return true;
        }
        try {
          console.log('[刷新] 从 MySQL 拉取...');
          const res = await fetch(`${API_BASE}/accounts`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            console.error('[刷新] HTTP 失败:', res.status);
            return false;
          }
          const data = await res.json();
          const list = (data.accounts || []).map(fromDb);
          console.log(`[刷新] 成功 ${list.length} 条`, list.slice(0, 3).map(a => ({ id: a.id, date: a.date, type: a.type, amount: a.amount })));
          set({ cloudAccounts: list, accounts: list });
          return true;
        } catch (e) {
          console.error('[刷新] 异常:', e);
          return false;
        }
      },

      // 添加一条
      addAccount: async (entry) => {
        const token = hasToken();

        if (token) {
          // 已登录：写 MySQL
          try {
            console.log('[添加] 写入 MySQL:', entry);
            const res = await fetch(`${API_BASE}/accounts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                type: entry.type,
                category: entry.category,
                subCategory: entry.subCategory || null,
                amount: entry.amount,
                unit: entry.unit || null,
                quantity: entry.quantity || null,
                note: entry.note || null,
                recordDate: entry.date,
              }),
            });
            if (!res.ok) {
              console.error('[添加] HTTP 失败:', res.status);
              return false;
            }
            console.log('[添加] MySQL 成功');
            await get().refreshAccounts();
            return true;
          } catch (e) {
            console.error('[添加] 异常:', e);
            return false;
          }
        } else {
          // 未登录：写本地
          const newEntry: AccountEntry = {
            ...entry,
            id: Date.now().toString() + Math.floor(Math.random() * 1000),
          };
          const next = [...get().localAccounts, newEntry];
          console.log('[添加] 本地:', newEntry);
          set({ localAccounts: next, accounts: next });
          return true;
        }
      },

      // 删除一条
      deleteAccount: async (id) => {
        const token = hasToken();

        if (token) {
          // 已登录：删 MySQL
          try {
            console.log('[删除] MySQL id:', id);
            const res = await fetch(`${API_BASE}/accounts/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
              console.error('[删除] HTTP 失败:', res.status);
              return false;
            }
            console.log('[删除] MySQL 成功');
            await get().refreshAccounts();
            return true;
          } catch (e) {
            console.error('[删除] 异常:', e);
            return false;
          }
        } else {
          // 未登录：删本地
          const next = get().localAccounts.filter((a) => a.id !== id);
          console.log('[删除] 本地:', id);
          set({ localAccounts: next, accounts: next });
          return true;
        }
      },
    }),
    {
      name: 'app-storage',
      // 只持久化 localAccounts，不持久化 cloudAccounts
      partialize: (state) => ({
        localAccounts: state.localAccounts,
      }),
      // 恢复后：根据登录状态选择数据源
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (hasToken()) {
            // 已登录：从 MySQL 拉取
            setTimeout(() => state.refreshAccounts(), 50);
          } else {
            // 未登录：使用本地数据
            state.accounts = state.localAccounts;
          }
        }
      },
    }
  )
);
