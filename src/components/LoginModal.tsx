import React, { useState } from 'react';
import { X, Eye, EyeOff, Check } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'register';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { theme } = useThemeStore();
  const { login, register } = useUserStore();
  const [mode, setMode] = useState<Mode>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const { success: loginSuccess, error: loginError } = await login(phone, password);
        if (loginSuccess) {
          setSuccess('登录成功！');
          setTimeout(onClose, 1000);
        } else {
          setError(loginError || '登录失败，请检查手机号或密码');
        }
      } else {
        const { success: registerSuccess, error: registerError } = await register(phone, password);
        if (registerSuccess) {
          setSuccess('注册成功！');
          setTimeout(onClose, 1000);
        } else {
          setError(registerError || '注册失败，手机号可能已被注册');
        }
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden
        ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-amber-900'}
            `}>
              {mode === 'login' ? '登录账号' : '注册账号'}
            </h2>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors
                ${theme === 'dark' 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }
              `}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2
                ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}
              `}>
                手机号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2
                  ${theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-amber-400 focus:ring-amber-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-amber-400/30'
                  }
                `}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2
                ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}
              `}>
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all focus:outline-none focus:ring-2
                    ${theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-amber-400 focus:ring-amber-400/30'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-amber-400/30'
                    }
                  `}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2
                    ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                  `}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-rose-500 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Check size={16} className="text-emerald-500" />
                <span className="text-emerald-500 text-sm">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                ${loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {loading ? (
                <span className="animate-pulse">加载中...</span>
              ) : (
                mode === 'login' ? '登录' : '注册'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
                setSuccess('');
              }}
              className={`text-sm font-medium transition-colors
                ${theme === 'dark'
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-amber-600 hover:text-amber-700'
                }
              `}
            >
              {mode === 'login' ? '还没有账号？立即注册' : '已有账号？立即登录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
