import React from 'react';
import { Info, Globe, FileText, Shield, RefreshCw, ChevronRight } from 'lucide-react';
import { SubPageContainer } from '../components/Layout/SubPageContainer';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  const { theme } = useThemeStore();
  const { checkUpdate, getAppVersion } = useUserStore();
  const [checking, setChecking] = React.useState(false);
  const [updateInfo, setUpdateInfo] = React.useState<{
    hasUpdate: boolean;
    version: string;
    releaseNote: string;
    downloadUrl: string;
  } | null>(null);

  const handleCheckUpdate = async () => {
    setChecking(true);
    setUpdateInfo(null);
    
    const result = await checkUpdate();
    setUpdateInfo(result);
    setChecking(false);
  };

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
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}>
              <RefreshCw size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
            </div>
            <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              版本更新
            </h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCheckUpdate}
              disabled={checking}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {checking ? '检查中...' : '检查更新'}
            </button>

            {updateInfo && (
              <div className={`p-4 rounded-xl border ${
                updateInfo.hasUpdate
                  ? theme === 'dark'
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-green-50 border-green-200'
                  : theme === 'dark'
                  ? 'bg-slate-700 border-slate-600'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                {updateInfo.hasUpdate ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                      }`}>
                        <Info size={16} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                      </div>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        发现新版本 v{updateInfo.version}
                      </span>
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {updateInfo.releaseNote}
                    </div>
                    <a
                      href={updateInfo.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 text-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium"
                    >
                      立即更新
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <Info size={16} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                    </div>
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      当前已是最新版本
                    </span>
                  </div>
                )}
              </div>
            )}
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
