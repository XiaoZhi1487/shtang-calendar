import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  /** 用户选择的主题，'system' 表示跟随系统 */
  theme: Theme;
  /** 当前实际生效的主题（'light' 或 'dark'），由 store 内部计算 */
  resolved: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(resolved: 'light' | 'dark') {
  // 应用到 <html> 元素，供 Tailwind darkMode: "class" 使用
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolved);
  // 同步 meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#0f172a' : '#ffffff');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => {
      // 初始化时马上应用主题
      const initial = resolveTheme('light');
      applyTheme(initial);

      return {
        theme: 'light' as Theme,
        resolved: initial,

        toggleTheme: () => {
          const current = get().resolved;
          const next: Theme = current === 'light' ? 'dark' : 'light';
          const resolved = resolveTheme(next);
          applyTheme(resolved);
          set({ theme: next, resolved });
        },

        setTheme: (theme) => {
          const resolved = resolveTheme(theme);
          applyTheme(resolved);
          set({ theme, resolved });
        },
      };
    },
    {
      name: 'app-theme-storage',
      // 恢复持久化数据后，重新应用主题
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.theme);
          applyTheme(resolved);
          state.resolved = resolved;
        }
      },
    }
  )
);

// 监听系统主题变化（仅当用户选择 'system' 时自动切换）
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      const resolved = getSystemTheme();
      applyTheme(resolved);
      useThemeStore.setState({ resolved });
    }
  });
}