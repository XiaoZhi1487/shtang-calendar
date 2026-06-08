import React, { useState } from 'react';
import { 
  User, Lock, Settings, HelpCircle, RefreshCw, Info, 
  LogOut, Users, ChevronRight, Bell,
  MessageSquare, FileText, Shield, Database
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { useAppStore } from '../store/useAppStore';
import { LoginModal } from '../components/LoginModal';
import { UpdateModal } from '../components/UpdateModal';
import { AccountSecurityPage } from './AccountSecurityPage';
import { AppSettingsPage } from './AppSettingsPage';
import { HelpFeedbackPage } from './HelpFeedbackPage';
import { AboutPage } from './AboutPage';

type PageType = 'main' | 'accountSecurity' | 'appSettings' | 'helpFeedback' | 'about';

export function MyPage() {
  const { theme } = useThemeStore();
  const { user, isLoggedIn, logout, checkUpdate, getAppVersion, token } = useUserStore();
  const { syncToCloud, loadFromCloud } = useAppStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showUpdateInfo, setShowUpdateInfo] = useState<string | null>(null); // 显示已是最新版本等提示
  const [updateData, setUpdateData] = useState<{
    version: string;
    releaseNote: string;
    downloadUrl: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('main');
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const handleCheckUpdate = async () => {
    setChecking(true);
    setShowUpdateInfo(null);
    setUpdateData(null);

    const result = await checkUpdate();
    const currentVersion = getAppVersion();

    if (result.hasUpdate) {
      // 有新版本
      if (result.version !== currentVersion) {
        // 服务器版本 > 本地版本，显示更新弹窗
        setUpdateData({
          version: result.version,
          releaseNote: result.releaseNote,
          downloadUrl: result.downloadUrl
        });
        setShowUpdate(true);
      } else {
        // 版本相同，显示已是最新版本提示
        setShowUpdateInfo('当前已是最新版本');
        setTimeout(() => setShowUpdateInfo(null), 3000);
      }
    } else {
      // 没有新版本，或服务器返回空
      if (!result.version) {
        setShowUpdateInfo('无法检查更新，请稍后再试');
      } else {
        setShowUpdateInfo('当前已是最新版本');
      }
      setTimeout(() => setShowUpdateInfo(null), 3000);
    }
    setChecking(false);
  };

  const handleUpdate = () => {
    if (updateData?.downloadUrl) {
      window.open(updateData.downloadUrl, '_blank');
    }
    setShowUpdate(false);
  };

  const handleSyncData = async () => {
    setSyncing(true);
    setSyncStatus('syncing');
    try {
      if (!token) {
        setSyncStatus('error');
        return;
      }
      const success = await syncToCloud(token);
      if (success) {
        setSyncStatus('success');
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      setSyncStatus('error');
    }
    setSyncing(false);
  };

  // 根据当前页面渲染内容
  if (currentPage === 'accountSecurity') {
    return <AccountSecurityPage onBack={() => setCurrentPage('main')} />;
  }
  
  if (currentPage === 'appSettings') {
    return <AppSettingsPage onBack={() => setCurrentPage('main')} />;
  }
  
  if (currentPage === 'helpFeedback') {
    return <HelpFeedbackPage onBack={() => setCurrentPage('main')} />;
  }
  
  if (currentPage === 'about') {
    return <AboutPage onBack={() => setCurrentPage('main')} />;
  }

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300
      ${theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
      }
    `}>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      {updateData && (
        <UpdateModal 
          isOpen={showUpdate} 
          onClose={() => setShowUpdate(false)} 
          onUpdate={handleUpdate}
          version={updateData.version}
          releaseNote={updateData.releaseNote}
          downloadUrl={updateData.downloadUrl}
        />
      )}

      {/* 顶部账号卡片 - 新配色 */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            {isLoggedIn ? (
              <>
                <div className="text-white text-xl font-bold">{user?.phone}</div>
                <div className="text-white/80 text-sm mt-1">已登录 · 数据已同步</div>
              </>
            ) : (
              <div onClick={() => setShowLogin(true)} className="cursor-pointer">
                <div className="text-white text-xl font-bold">未登录</div>
                <div className="text-white/80 text-sm mt-1">点击登录账号</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 账号安全 */}
        <div className={`rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'} shadow-sm overflow-hidden`}>
          <div className="px-4 py-3 border-b border-slate-700/20">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Shield size={16} />
              账号安全
            </div>
          </div>

          {isLoggedIn ? (
            <>
              <div 
                onClick={() => setCurrentPage('accountSecurity')}
                className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors
                  ${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                    ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'}
                  `}>
                    <Lock size={18} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                  </div>
                  <div>
                    <div className={`font-medium
                      ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                    `}>
                      修改密码
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
              </div>

              <div 
                onClick={handleSyncData}
                className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors border-t border-slate-700/20
                  ${theme === 'dark' ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                    ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}
                  `}>
                    <Database size={18} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} ${syncing ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <div className={`font-medium
                      ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                    `}>
                      同步数据
                    </div>
                    <div className={`text-xs
                      ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                    `}>
                      {syncStatus === 'syncing' ? '同步中...' : syncStatus === 'success' ? '同步成功' : '与云端同步数据'}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
              </div>
            </>
          ) : (
            <div 
              onClick={() => setShowLogin(true)}
              className={`p-6 cursor-pointer transition-all
                ${theme === 'dark' ? 'hover:bg-slate-700/30' : 'hover:bg-blue-50'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}
                `}>
                  <User size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div>
                  <div className={`font-medium
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    登录账号
                  </div>
                  <div className={`text-xs
                    ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                  `}>
                    登录后同步数据到云端
                  </div>
                </div>
                <ChevronRight size={18} className="ml-auto text-slate-400" />
              </div>
            </div>
          )}
        </div>

        {/* 应用设置 */}
        <div className={`rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'} shadow-sm overflow-hidden`}>
          <div className="px-4 py-3 border-b border-slate-700/20">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Settings size={16} />
              应用设置
            </div>
          </div>

          <div 
            onClick={() => setCurrentPage('appSettings')}
            className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors
              ${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'}
              `}>
                <Settings size={18} className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} />
              </div>
              <div>
                <div className={`font-medium
                  ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                `}>
                  应用设置
                </div>
              </div>
            </div>
            <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
          </div>
        </div>

        {/* 帮助与反馈 */}
        <div className={`rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'} shadow-sm overflow-hidden`}>
          <div className="px-4 py-3 border-b border-slate-700/20">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <HelpCircle size={16} />
              帮助与反馈
            </div>
          </div>

          <div 
            onClick={() => setCurrentPage('helpFeedback')}
            className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors
              ${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}
              `}>
                <MessageSquare size={18} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
              </div>
              <div>
                <div className={`font-medium
                  ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                `}>
                  帮助与反馈
                </div>
              </div>
            </div>
            <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
          </div>
        </div>

        {/* 关于 */}
        <div className={`rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'} shadow-sm overflow-hidden`}>
          <div
            onClick={handleCheckUpdate}
            className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors
              ${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'}
              `}>
                <RefreshCw size={18} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} ${checking ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className={`font-medium
                  ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                `}>
                  检查更新
                </div>
                <div className={`text-xs
                      ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                    `}>
                      {checking ? '检查中...' : (showUpdateInfo || `当前版本 v${getAppVersion()}`)}
                    </div>
              </div>
            </div>
            <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
          </div>

          <div 
            onClick={() => setCurrentPage('about')}
            className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors border-t border-slate-700/20
              ${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                ${theme === 'dark' ? 'bg-slate-500/20' : 'bg-slate-200'}
              `}>
                <Info size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} />
              </div>
              <div>
                <div className={`font-medium
                  ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                `}>
                  关于我们
                </div>
              </div>
            </div>
            <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
          </div>
        </div>

        {/* 账号操作 */}
        {isLoggedIn && (
          <div className={`rounded-2xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'} shadow-sm overflow-hidden`}>
            <div 
              onClick={() => {
                logout();
                setShowLogin(true);
              }}
              className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors
                ${theme === 'dark' ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                  ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}
                `}>
                  <Users size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div>
                  <div className={`font-medium
                    ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                  `}>
                    切换账号
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
            </div>

            <div 
              onClick={logout}
              className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors border-t border-slate-700/20
                ${theme === 'dark' ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                  ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'}
                `}>
                  <LogOut size={18} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
                </div>
                <div>
                  <div className={`font-medium
                    ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}
                  `}>
                    退出登录
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部版权 */}
        <div className="text-center py-6">
          <div className={`text-xs
            ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}
          `}>
            © 2024 沙塘圩日历 · 柳州沙塘镇
          </div>
          <div className={`text-xs mt-1
            ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}
          `}>
            为沙塘居民打造的生活助手
          </div>
        </div>
      </div>
    </div>
  );
}
