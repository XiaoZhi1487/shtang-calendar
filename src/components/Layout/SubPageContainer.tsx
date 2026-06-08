import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

interface SubPageContainerProps {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
}

export function SubPageContainer({ title, children, onBack }: SubPageContainerProps) {
  const { theme } = useThemeStore();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
    }`}>
      <div className={`sticky top-0 z-10 px-4 py-3 flex items-center gap-3 backdrop-blur-md border-b ${
        theme === 'dark' ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-amber-100'
      }`}>
        <button 
          onClick={onBack} 
          className={`p-2 rounded-full transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
          }`}
        >
          <ChevronLeft size={22} className={theme === 'dark' ? 'text-white' : 'text-slate-900'} />
        </button>
        <h1 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-amber-900'}`}>
          {title}
        </h1>
      </div>
      <div className="px-4 py-4">
        {children}
      </div>
    </div>
  );
}
