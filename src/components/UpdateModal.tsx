import React from 'react';
import { X, Download } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  version: string;
  releaseNote: string;
  downloadUrl: string;
}

export function UpdateModal({ 
  isOpen, onClose, onUpdate, version, releaseNote, downloadUrl }: UpdateModalProps) {
  const { theme } = useThemeStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden
        ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}
      `}>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
          <Download size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">发现新版本</h2>
        <p className="text-white/90 text-sm">沙塘圩日历 {version}</p>
      </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className={`font-semibold mb-2
              ${theme === 'dark' ? 'text-white' : 'text-amber-900'}
            `}>
              更新内容
            </h3>
            <div className={`p-4 rounded-xl text-sm
              ${theme === 'dark' ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-700'}
            `}>
              <p>{releaseNote || '优化了用户体验和性能优化'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onUpdate}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              立即更新
            </button>
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-semibold transition-all
                ${theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}
              `}
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
