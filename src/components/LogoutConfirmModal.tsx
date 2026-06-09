import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  const { theme } = useThemeStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden
        ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center
              ${theme === 'dark' ? 'bg-rose-500/20' : 'bg-rose-100'}
            `}>
              <AlertTriangle size={28} className="text-rose-500" />
            </div>
          </div>

          <h3 className={`text-lg font-bold text-center mb-2
            ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
          `}>
            确认退出登录？
          </h3>

          <p className={`text-sm text-center mb-6
            ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}
          `}>
            退出后云端数据将保留，下次登录可继续使用
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-colors
                ${theme === 'dark'
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors"
            >
              确认退出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
