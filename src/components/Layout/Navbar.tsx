import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Wallet, TrendingUp, User } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const navItems = [
  { path: '/', icon: Calendar, label: '圩日历' },
  { path: '/account', icon: Wallet, label: '记账' },
  { path: '/profit', icon: TrendingUp, label: '收益' },
  { path: '/my', icon: User, label: '我的' },
];

export function Navbar() {
  const { theme } = useThemeStore();

  return (
    <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]
      ${theme === 'dark'
        ? 'bg-slate-900/98 border-slate-700/70'
        : 'bg-amber-50/98 border-amber-200/70'
      }
    `}>
      <div className="max-w-lg mx-auto">
        {/* Navigation items */}
        <div className="flex justify-around items-center h-18">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'text-rose-500 bg-gradient-to-br from-rose-500/20 to-orange-500/10 shadow-lg shadow-rose-500/20'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-200/50'
                }`
              }
            >
              <Icon size={24} strokeWidth={2.2} />
              <span className="text-xs font-semibold">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
