import React from 'react';
import { Sun, Moon, Monitor, Bell, Smartphone } from 'lucide-react';
import { SubPageContainer } from '../components/Layout/SubPageContainer';
import { useThemeStore } from '../store/themeStore';

type ThemeMode = 'light' | 'dark' | 'system';

interface AppSettingsPageProps {
  onBack: () => void;
}

export function AppSettingsPage({ onBack }: AppSettingsPageProps) {
  const { theme, setTheme } = useThemeStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'light', label: '白日模式', icon: <Sun size={20} />, description: '始终使用浅色主题' },
    { value: 'dark', label: '暗夜模式', icon: <Moon size={20} />, description: '始终使用深色主题' },
    { value: 'system', label: '跟随系统', icon: <Monitor size={20} />, description: '根据系统设置自动切换' },
  ];

  const isSelected = (optionValue: ThemeMode) => {
    if (optionValue === 'system') {
      return theme !== 'light' && theme !== 'dark';
    }
    return theme === optionValue;
  };

  return (
    <SubPageContainer title="应用设置" onBack={onBack}>
      <div className="space-y-5">
        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}>
              <Smartphone size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
            </div>
            <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              主题模式
            </h2>
          </div>

          <div className="space-y-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all border ${
                  isSelected(option.value)
                    ? theme === 'dark'
                      ? 'bg-amber-500/20 border-amber-500/50'
                      : 'bg-amber-100 border-amber-300'
                    : theme === 'dark'
                    ? 'bg-slate-700/50 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected(option.value)
                    ? theme === 'dark'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-500 text-white'
                    : theme === 'dark'
                    ? 'bg-slate-600 text-slate-300'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-medium ${
                    isSelected(option.value)
                      ? theme === 'dark'
                        ? 'text-amber-400'
                        : 'text-amber-700'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}>
                    {option.label}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {option.description}
                  </div>
                </div>
                {isSelected(option.value) && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-amber-500' : 'bg-amber-500'
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Bell size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              消息通知
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl">
            <div>
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                启用通知
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                接收系统通知和更新提醒
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                notificationsEnabled
                  ? theme === 'dark' ? 'bg-amber-500' : 'bg-amber-500'
                  : theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                notificationsEnabled ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            其他设置
          </h3>
          <div className={`space-y-3 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between py-3 border-b">
              <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                清除缓存
              </span>
              <span className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                12.5 MB
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                重置设置
              </span>
            </div>
          </div>
        </div>
      </div>
    </SubPageContainer>
  );
}
