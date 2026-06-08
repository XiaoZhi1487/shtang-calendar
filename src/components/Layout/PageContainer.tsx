import React from 'react';
import { useThemeStore } from '../../store/themeStore';

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  const { theme } = useThemeStore();

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300
      ${theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
      }
    `}>
      <div className="max-w-2xl mx-auto px-5 py-6">
        {children}
      </div>
    </div>
  );
}
