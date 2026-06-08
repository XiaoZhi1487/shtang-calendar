import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import {
  isMarketDay,
  getLunarDay,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  weekDays,
} from '../../utils/dateUtils';
import { useThemeStore } from '../../store/themeStore';

export function Calendar() {
  const [today, setToday] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const { theme } = useThemeStore();

  // Refresh today's date to make sure it's correct
  useEffect(() => {
    setToday(new Date());
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (day: number) => {
    const result = (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
    return result;
  };

  const renderDays = () => {
    const days = [];

    // Calculate previous month days to show
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    
    // Days from previous month
    for (let i = 0; i < firstDay; i++) {
      const day = daysInPrevMonth - firstDay + 1 + i;
      const marketDay = isMarketDay(prevYear, prevMonth, day);
      const lunarDay = getLunarDay(prevYear, prevMonth, day);
      
      days.push(
        <div
          key={`prev-${day}`}
          className={`
            h-14 sm:h-16 flex flex-col items-center justify-center rounded-2xl text-base font-medium transition-all duration-300 relative text-slate-500 opacity-40
          `}
        >
          {marketDay && (
            <div className="absolute -top-1.5 -right-1.5 bg-yellow-400/70 text-xs font-bold px-1.5 py-0.5 rounded-full text-slate-900 shadow-sm z-10">
              圩
            </div>
          )}
          <span className="text-base sm:text-xl">{day}</span>
          <span className="text-[10px] sm:text-xs opacity-60">{lunarDay}</span>
        </div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const marketDay = isMarketDay(currentYear, currentMonth, day);
      const lunarDay = getLunarDay(currentYear, currentMonth, day);
      const todayIs = isToday(day);

      days.push(
        <div
          key={day}
          className={`
            h-14 sm:h-16 flex flex-col items-center justify-center rounded-2xl text-base font-medium transition-all duration-300 relative
            ${marketDay
              ? 'bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/40 scale-105'
              : 'text-slate-300 hover:bg-slate-700/30'
            }
            ${todayIs 
              ? (marketDay 
                  ? 'ring-4 ring-yellow-300 ring-offset-2 ring-offset-slate-900' 
                  : 'ring-3 ring-amber-400 ring-offset-2 ring-offset-slate-900 bg-gradient-to-br from-amber-500/20 to-orange-500/10'
                ) 
              : ''}
          `}
        >
          {marketDay && (
            <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-full text-slate-900 shadow-md z-10">
              圩
            </div>
          )}
          <span className="text-lg sm:text-2xl">{day}</span>
          <span className="text-[10px] sm:text-xs opacity-75">{lunarDay}</span>
        </div>
      );
    }

    // Calculate days from next month to fill the grid
    const totalDaysShown = firstDay + daysInMonth;
    const daysToAdd = 7 - (totalDaysShown % 7);
    if (daysToAdd < 7) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      
      for (let day = 1; day <= daysToAdd; day++) {
        const marketDay = isMarketDay(nextYear, nextMonth, day);
        const lunarDay = getLunarDay(nextYear, nextMonth, day);
        
        days.push(
          <div
            key={`next-${day}`}
            className={`
              h-14 sm:h-16 flex flex-col items-center justify-center rounded-2xl text-base font-medium transition-all duration-300 relative text-slate-500 opacity-40
            `}
          >
            {marketDay && (
              <div className="absolute -top-1.5 -right-1.5 bg-yellow-400/70 text-xs font-bold px-1.5 py-0.5 rounded-full text-slate-900 shadow-sm z-10">
                圩
              </div>
            )}
            <span className="text-base sm:text-xl">{day}</span>
            <span className="text-[10px] sm:text-xs opacity-60">{lunarDay}</span>
          </div>
        );
      }
    }

    return days;
  };

  return (
    <div className="px-2 py-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-7">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200
              ${theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                : 'text-amber-800 hover:text-amber-900 hover:bg-amber-200/50'
              }
            `}
          >
            <ChevronLeft size={28} />
          </button>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-wider
            ${theme === 'dark' ? 'text-white' : 'text-amber-900'}
          `}>
            {currentYear}年 {getMonthName(currentMonth)}
          </h2>
          <button
            onClick={nextMonth}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200
              ${theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                : 'text-amber-800 hover:text-amber-900 hover:bg-amber-200/50'
              }
            `}
          >
            <ChevronRight size={28} />
          </button>
        </div>
        <div className={`flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-xl border
          ${theme === 'dark'
            ? 'text-slate-300 bg-slate-800/50 border-slate-700/30'
            : 'text-amber-800 bg-amber-100/60 border-amber-200/50'
          }
        `}>
          <MapPin size={18} className="text-rose-500" />
          <span>沙塘新街 · 三天一圩</span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 mb-3 sm:mb-4">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`h-8 sm:h-10 flex items-center justify-center text-sm sm:text-base font-bold tracking-wider
              ${index === 0 || index === 6 
                ? (theme === 'dark' ? 'text-rose-400' : 'text-rose-600')
                : (theme === 'dark' ? 'text-slate-500' : 'text-amber-600')
              }
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {(() => {
          const renderedDays = renderDays();
          return renderedDays.map((day) => {
            return React.cloneElement(day as React.ReactElement, {
              className: (day as React.ReactElement).props.className?.replace(
                'text-slate-500',
                theme === 'dark' ? 'text-slate-500' : 'text-amber-400'
              )?.replace(
                'text-slate-300',
                theme === 'dark' ? 'text-slate-300' : 'text-amber-900'
              )?.replace(
                'hover:bg-slate-700/30',
                theme === 'dark' ? 'hover:bg-slate-700/30' : 'hover:bg-amber-200/40'
              )
            });
          });
        })()}
      </div>

      {/* Legend */}
      <div className={`mt-6 sm:mt-8 pt-5 sm:pt-6 border-t flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-sm sm:text-base
        ${theme === 'dark'
          ? 'border-slate-700/30 text-slate-400'
          : 'border-amber-200/50 text-amber-700'
        }
      `}>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 shadow-md shadow-rose-500/40" />
          <span>圩日 · 沙塘镇</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-lg ring-2 sm:ring-3 ring-amber-400 ring-offset-2 bg-gradient-to-br from-amber-500/20 to-orange-500/10
            ${theme === 'dark' 
                ? 'ring-offset-slate-900'
                : 'ring-offset-amber-50'
            }
          `} />
          <span>今天</span>
        </div>
      </div>
    </div>
  );
}
