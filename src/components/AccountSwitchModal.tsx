import React, { useState, useEffect } from 'react';
import { X, User, Plus, Check, Trash2 } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { useAppStore } from '../store/useAppStore';

interface AccountSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedAccount {
  phone: string;
  lastLogin: number;
}

// 本地存储的 key
const SAVED_ACCOUNTS_KEY = 'shtang-saved-accounts';

function getSavedAccounts(): SavedAccount[] {
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccount(phone: string) {
  const accounts = getSavedAccounts();
  const existing = accounts.find(a => a.phone === phone);
  if (existing) {
    existing.lastLogin = Date.now();
  } else {
    accounts.push({ phone, lastLogin: Date.now() });
  }
  // 按最后登录时间排序
  accounts.sort((a, b) => b.lastLogin - a.lastLogin);
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function removeAccount(phone: string) {
  const accounts = getSavedAccounts().filter(a => a.phone !== phone);
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function AccountSwitchModal({ isOpen, onClose }: AccountSwitchModalProps) {
  const { theme } = useThemeStore();
  const { user, login } = useUserStore();

  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSavedAccounts(getSavedAccounts());
      setShowLogin(false);
      setPhone('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { success, error: loginError } = await login(phone, password);
      if (success) {
        saveAccount(phone);
        // 登录成功后 login() 内部已调用 loadFromCloud 从云端拉取该账号数据
        // 此处不要再调用 syncToCloud，避免将上一个账号的本地数据上传覆盖
        onClose();
      } else {
        setError(loginError || '登录失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchTo = async (phone: string) => {
    // 如果是当前账号，直接关闭
    if (user?.phone === phone) {
      onClose();
      return;
    }
    // 需要输入密码
    setPhone(phone);
    setShowLogin(true);
  };

  const handleRemoveAccount = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeAccount(phone);
    setSavedAccounts(getSavedAccounts());
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
              {showLogin ? '登录账号' : '切换账号'}
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

          {showLogin ? (
            // 登录表单
            <form onSubmit={handleLogin} className="space-y-4">
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
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2
                    ${theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-amber-400 focus:ring-amber-400/30'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-amber-400/30'
                    }
                  `}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-rose-500 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition-all
                  ${loading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
                  }
                `}
              >
                {loading ? '登录中...' : '登录'}
              </button>

              <button
                type="button"
                onClick={() => { setShowLogin(false); setError(''); }}
                className={`w-full py-2 text-sm
                  ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                `}
              >
                返回账号列表
              </button>
            </form>
          ) : (
            // 账号列表
            <div className="space-y-3">
              {savedAccounts.length === 0 ? (
                <div className={`text-center py-8
                  ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
                `}>
                  <User size={40} className="mx-auto mb-3 opacity-50" />
                  <p>暂无已登录的账号</p>
                </div>
              ) : (
                savedAccounts.map((account) => (
                  <div
                    key={account.phone}
                    onClick={() => handleSwitchTo(account.phone)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors
                      ${theme === 'dark' 
                        ? 'bg-slate-700/50 hover:bg-slate-700' 
                        : 'bg-slate-50 hover:bg-slate-100'
                      }
                      ${user?.phone === account.phone ? 'ring-2 ring-amber-500' : ''}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-200'}
                    `}>
                      <User size={18} className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium
                        ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                      `}>
                        {account.phone}
                      </div>
                      {user?.phone === account.phone && (
                        <div className="text-xs text-amber-500">当前账号</div>
                      )}
                    </div>
                    {user?.phone === account.phone ? (
                      <Check size={18} className="text-amber-500" />
                    ) : (
                      <button
                        onClick={(e) => handleRemoveAccount(account.phone, e)}
                        className={`p-1.5 rounded-lg transition-colors
                          ${theme === 'dark' 
                            ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-600' 
                            : 'text-slate-400 hover:text-rose-500 hover:bg-slate-200'
                          }
                        `}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}

              {/* 添加账号按钮 */}
              <button
                onClick={() => { setShowLogin(true); setPhone(''); setPassword(''); setError(''); }}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors
                  ${theme === 'dark'
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                  }
                `}
              >
                <Plus size={18} />
                添加账号
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 导出保存账号函数，供登录成功后调用
export { saveAccount };
