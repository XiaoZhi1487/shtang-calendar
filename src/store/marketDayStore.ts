import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MarketDayState {
  // 街日名称（如 "沙塘圩"）
  marketDayName: string;
  // 基准日期 (YYYY-MM-DD)，从这一天开始算街日
  baseDate: string;
  // 间隔天数（每 N 天一街）
  intervalDays: number;

  setMarketDayName: (name: string) => void;
  setBaseDate: (date: string) => void;
  setIntervalDays: (days: number) => void;
}

export const useMarketDayStore = create<MarketDayState>()(
  persist(
    (set) => ({
      // 默认：2024-01-01 为基准，每 3 天一街
      marketDayName: '沙塘圩',
      baseDate: '2024-01-01',
      intervalDays: 3,

      setMarketDayName: (name) => set({ marketDayName: name }),
      setBaseDate: (date) => set({ baseDate: date }),
      setIntervalDays: (days) => set({ intervalDays: days }),
    }),
    {
      name: 'market-day-storage',
    }
  )
);