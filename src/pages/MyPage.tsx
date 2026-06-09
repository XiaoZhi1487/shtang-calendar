import React, { useState } from 'react';
import {
  User, Lock, Settings, HelpCircle, RefreshCw, Info,
  LogOut, Users, ChevronRight,
  MessageSquare, Shield, Database
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { useAppStore } from '../store/useAppStore';
import { LoginModal } from '../components/LoginModal';
import { UpdateModal } from '../components/UpdateModal';
import { AccountSwitchModal, saveAccount } from '../components/AccountSwitchModal';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';
import { AccountSecurityPage } from './AccountSecurityPage';
import { AppSettingsPage } from './AppSettingsPage';
import { HelpFeedbackPage } from './HelpFeedbackPage';
import { AboutPage } from './AboutPage';

type PageType = 'main' | 'accountSecurity' | 'appSettings' | 'helpFeedback' | 'about';

export function MyPage() {
  const { theme } = useThemeStore();
  const { user, isLoggedIn, logout, checkUpdate, getAppVersion, token } = useUserStore();
  const { syncToCloud } = useAppStore();

  const [showLogin, setShowLogin] = useState(false);
  const [showAccountSwitch, setShowAccountSwitch] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showUpdateInfo, setShowUpdateInfo] = useState<string | null>(null);
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
      if (result.version !== currentVersion) {
        setUpdateData({
          version: result.version,
          releaseNote: result.releaseNote,
          downloadUrl: result.downloadUrl
        });
        setShowUpdate(true);
      } else {
        setShowUpdateInfo('当前已是最新版本');
        setTimeout(() => setShowUpdateInfo(null), 3000);
      }
    } else {
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

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  // 子页面渲染
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

  // CSS类名辅助函数
  const bgDark = 'bg-slate-800';
  const bgLight = 'bg-white';
  const borderDark = 'border-slate-700/20';
  const borderLight = 'border-slate-200';

  // 主页面
  return (
    <div className={theme === 'dark' ? 'min-h-screen pb-24 bg-slate-900' : 'min-h-screen pb-24 bg-amber-50'}>
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
      />
      <AccountSwitchModal 
        isOpen={showAccountSwitch} 
        onClose={() => setShowAccountSwitch(false)} 
      />
      <LogoutConfirmModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={handleLogout} 
      />
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

      <div className="bg-amber-500 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            {isLoggedIn ? (
              <>
                <div className="text-white text-xl font-bold">{user?.phone}</div>
                <div className="text-white/80 text-sm mt-1">已登录</div>
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
        <div className={theme === 'dark' ? `rounded-2xl ${bgDark} shadow-sm overflow-hidden` : `rounded-2xl ${bgLight} shadow-sm overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${theme === 'dark' ? borderDark : borderLight}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Shield size={16} />
              账号安全
            </div>
          </div>

          {isLoggedIn ? (
            <>
              <div onClick={() => setCurrentPage('accountSecurity')}
                className={theme === 'dark' ? 'flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-700/50' : 'flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50'}>
                <div className="flex items-center gap-3">
                  <div className={theme === 'dark' ? 'w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/20' : 'w-9 h-9 rounded-lg flex items-center justify-center bg-amber-100'}>
                    <Lock size={18} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                  </div>
                  <div>
                    <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-slate-900'}>修改密码</div>
                  </div>
                </div>
                <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
              </div>

              <div onClick={handleSyncData}
                className={theme === 'dark' ? 'flex items-center justify-between px-4 py-3.5 cursor-pointer border-t border-slate-700/20 hover:bg-blue-500/10' : 'flex items-center justify-between px-4 py-3.5 cursor-pointer border-t border-slate-200 hover:bg-blue-50'}>
                <div className="flex items-center gap-3">
                  <div className={theme === 'dark' ? 'w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/20' : 'w-9 h-9 rounded-lg flex items-center justify-center bg-blue-100'}>
                    <Database size={18} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} ${syncing ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-slate-900'}>同步数据</div>
                    <div className={theme === 'dark' ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>
                      {syncStatus === 'syncing' ? '同步中...' : syncStatus === 'success' ? '同步成功' : '与云端同步数据'}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
              </div>
            </>
          ) : (
            <div onClick={() => setShowLogin(true)}
              className={theme === 'dark' ? 'p-6 cursor-pointer hover:bg-slate-700/30' : 'p-6 cursor-pointer hover:bg-blue-50'}>
              <div className="flex items-center gap-4">
                <div className={theme === 'dark' ? 'w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/20' : 'w-10 h-10 rounded-full flex items-center justify-center bg-blue-100'}>
                  <User size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div>
                  <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-slate-900'}>登录账号</div>
                  <div className={theme === 'dark' ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>登录后同步数据到云端</div>
                </div>
                <ChevronRight size={18} className="ml-auto text-slate-400" />
              </div>
            </div>
          )}
        </div>

        {/* 应用设置 */}
        <div className={theme === 'dark' ? `rounded-2xl ${bgDark} shadow-sm overflow-hidden` : `rounded-2xl ${bgLight} shadow-sm overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${theme === 'dark' ? borderDark : borderLight}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Settings size={16} />
              应用设置
            </div>
          </div>

          <div onClick={() => setCurrentPage('appSettings')}
            className={theme === 'dark' ? 'flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-700/50' : 'flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50'}>
            <div className="flex items-center gap-3">
              <div className={theme === 'dark' ? 'w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-500/20' : 'w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-100'}>
                <Settings size={18} className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} />
              </div>
              <div>
                <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-slate-900'}>应用设置</div>
              </div>
            </div>
            <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
          </div>
        </div>

        {/* 帮助与反馈 */}
        <div className={theme === 'dark' ? `rounded-2xl ${bgDark} shadow-sm overflow-hidden` : `rounded-2xl ${bgLight} shadow-sm overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${theme === 'dark' ? borderDark : borderLight}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <HelpCircle size={16} />
              帮助与反馈
            </div>
          </div>

          <div onClick={() => setCurrentPage('helpFeedback')}
            className={theme === 'dark' ? 'flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-700/50' : 'flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50'}>
            <div className="flex items-center gap-3">
              <div className={theme === 'dark' ? 'w-9 h-9 rounded-lg flex items-center justify-center bg-green-500/20' : 'w-9 h-9 rounded-lg flex items-center justify-center bg-green-100'}>
                <MessageSquare size={18} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
              </div>
              <div>
                <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-slate-900'}>帮助与反馈</div>
              </div>
            </div>
            <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
          </div>
        </div>

        {/* 关于 */}
        <div className={theme === 'dark' ? `rounded-2xl ${bgDark} shadow-sm overflow-hidden` : `rounded-2xl ${bgLight} shadow-sm overflow-hidden`}>
          <div onClick={handleCheckUpdate}
            className={theme === 'dark' ? 'flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-700/50' : 'flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50'}>
            <div className="flex items-center gap-3">
              <div className={theme === 'dark' ? 'w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/20' : 'w-9 h-9 rounded-lg flex items-center justify-center bg-amber-100'}>
                <RefreshCw size={18} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} ${checking ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-slate-900'}>检查更新</div>
                <div className={theme === 'dark' ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>
                  {checking ? '检查中...' : (showUpdateInfo || `当前版本 v${getAppVersion()}`)}
                </div>
              </div>
            </div>
            <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
          </div>

          <div onClick={() => setCurrentPage('about')}
            className={theme === 'dark' ? 'flex items-center justify-between px-4 py-3.5 cursor-pointer border-t border-slate-700/20 hover:bg-slate-700/50' : 'flex items-center justify-between px-4 py-3.5 cursor-pointer border-t border-slate-200 hover:bg-slate-50'}>
            <div className="flex items-center gap-3">
              <div className={theme === 'dark' ? 'w-9 h-9 rounded-lg flex items-center justify-center bg-slate-500/20' : 'w-9 h-9 rounded-lg flex items-center justify-center bg-slate-200'}>
                <Info size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} />
              </div>
              <div>
                <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-slate-900'}>关于我们</div>
              </div>
            </div>
            <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
          </div>
        </div>

        {/* 账号操作 */}
        {isLoggedIn && (
          <div className={theme === 'dark' ? `rounded-2xl ${bgDark} shadow-sm overflow-hidden` : `rounded-2xl ${bgLight} shadow-sm overflow-hidden`}>
            <div onClick={() => setShowAccountSwitch(true)}
              className={theme === 'dark' ? 'flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-blue-500/10' : 'flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-blue-50'}>
              <div className="flex items-center gap-3">
                <div className={theme === 'dark' ? 'w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/20' : 'w-9 h-9 rounded-lg flex items-center justify-center bg-blue-100'}>
                  <Users size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div>
                  <div className={theme === 'dark' ? 'font-medium text-white' : 'font-medium text-slate-900'}>切换账号</div>
                </div>
              </div>
              <ChevronRight size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
            </div>

            <div onClick={() => setShowLogoutConfirm(true)}
              className={theme === 'dark' ? 'flex items-center justify-between px-4 py-3.5 cursor-pointer border-t border-slate-700/20 hover:bg-red-500/10' : 'flex items-center justify-between px-4 py-3.5 cursor-pointer border-t border-slate-200 hover:bg-red-50'}>
              <div className="flex items-center gap-3">
                <div className={theme === 'dark' ? 'w-9 h-9 rounded-lg flex items-center justify-center bg-red-500/20' : 'w-9 h-9 rounded-lg flex items-center justify-center bg-red-100'}>
                  <LogOut size={18} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
                </div>
                <div>
                  <div className={theme === 'dark' ? 'font-medium text-red-400' : 'font-medium text-red-600'}>退出登录</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部版权 */}
        <div className="text-center py-6">
          <div className={theme === 'dark' ? 'text-xs text-slate-500' : 'text-xs text-slate-400'}>© 2024 沙塘圩日历 · 柳州沙塘镇</div>
        </div>
      </div>
    </div>
  );
}
