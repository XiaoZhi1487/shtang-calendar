import React, { useState } from 'react';
import { Lock, Shield, User, Eye, EyeOff, Check } from 'lucide-react';
import { SubPageContainer } from '../components/Layout/SubPageContainer';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';

interface AccountSecurityPageProps {
  onBack: () => void;
}

export function AccountSecurityPage({ onBack }: AccountSecurityPageProps) {
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('密码长度不能少于6位');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSuccess(true);
    
    setTimeout(() => {
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 2000);
  };

  return (
    <SubPageContainer title="账号安全" onBack={onBack}>
      <div className="space-y-5">
        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}>
              <User size={28} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
            </div>
            <div>
              <div className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {user?.phone || '未登录'}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                当前登录账号
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}>
              <Shield size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
            </div>
            <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              修改密码
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                当前密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入当前密码"
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-amber-400 focus:ring-amber-400/30'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-amber-400/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                新密码
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少6位）"
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-amber-400 focus:ring-amber-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-amber-400/30'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                确认新密码
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-amber-400 focus:ring-amber-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-amber-400/30'
                }`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-red-500 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <Check size={16} className="text-green-500" />
                <span className="text-green-500 text-sm">密码修改成功！</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? '修改中...' : '确认修改'}
            </button>
          </form>
        </div>
      </div>
    </SubPageContainer>
  );
}
