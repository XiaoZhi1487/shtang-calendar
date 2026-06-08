import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'app-storage',
    }
  )
);
