import React from 'react';
import { Info, Globe, FileText, Shield, ChevronRight } from 'lucide-react';
import { SubPageContainer } from '../components/Layout/SubPageContainer';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  const { theme } = useThemeStore();
  const { getAppVersion } = useUserStore();

  return (
    <SubPageContainer title="关于我们" onBack={onBack}>
      <div className="space-y-5">
        <div className={`rounded-2xl p-6 text-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <div className={`w-20 h-20 mx-auto rounded-2xl mb-4 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg`}>
            <div className="text-white text-3xl font-bold">圩</div>
          </div>
          <h1 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            沙塘圩日历
          </h1>
          <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            版本 {getAppVersion()}
          </div>
          <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            © 2024 柳州沙塘镇
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            相关信息
          </h3>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
            }`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                <FileText size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} />
              </div>
              <div className={`flex-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                用户协议
              </div>
              <ChevronRight size={16} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
            }`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                <Shield size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} />
              </div>
              <div className={`flex-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                隐私政策
              </div>
              <ChevronRight size={16} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
            }`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                <Globe size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} />
              </div>
              <div className={`flex-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                官方网站
              </div>
              <ChevronRight size={16} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
            </div>
          </div>
        </div>
      </div>
    </SubPageContainer>
  );
}
