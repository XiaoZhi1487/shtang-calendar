import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Settings, X, CalendarDays } from 'lucide-react';
import {
  isMarketDaySolar,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  weekDays,
} from '../../utils/dateUtils';
import { useMarketDayStore } from '../../store/marketDayStore';
import { useThemeStore } from '../../store/themeStore';

// 最小滑动距离（px）才触发翻页
const SWIPE_THRESHOLD = 40;

export function Calendar() {
  const today = useRef(new Date()).current;
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [showSettings, setShowSettings] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const { marketDayName, baseDate, intervalDays, setMarketDayName, setBaseDate, setIntervalDays } = useMarketDayStore();
  const [tempName, setTempName] = useState(marketDayName);
  const [tempBaseDate, setTempBaseDate] = useState(baseDate);
  const [tempInterval, setTempInterval] = useState(intervalDays);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (showSettings) {
      setTempName(marketDayName);
      setTempBaseDate(baseDate);
      setTempInterval(intervalDays);
    }
  }, [showSettings]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const goToMonth = useCallback((year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  }, []);

  const prevMonth = useCallback(() => {
    goToMonth(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1
    );
  }, [currentYear, currentMonth, goToMonth]);

  const nextMonth = useCallback(() => {
    goToMonth(
      currentMonth === 11 ? currentYear + 1 : currentYear,
      currentMonth === 11 ? 0 : currentMonth + 1
    );
  }, [currentYear, currentMonth, goToMonth]);

  const goToToday = useCallback(() => {
    goToMonth(today.getFullYear(), today.getMonth());
  }, [today, goToMonth]);

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const saveSettings = () => {
    setMarketDayName(tempName.trim() || '圩日');
    setBaseDate(tempBaseDate);
    setIntervalDays(Math.max(1, tempInterval));
    setShowSettings(false);
  };

  // 触摸事件
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // 只在水平滑动距离 > 垂直滑动距离时才切换月份（防止滚动误触）
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) prevMonth();
      else nextMonth();
    }
  };

  const renderDays = () => {
    const days = [];

    // 上个月补位
    const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrev = getDaysInMonth(prevY, prevM);

    for (let i = 0; i < firstDay; i++) {
      const day = daysInPrev - firstDay + 1 + i;
      days.push(
        <div key={`prev-${day}`}
          className="h-14 sm:h-16 flex flex-col items-center justify-center rounded-2xl text-slate-500 opacity-30"
        >
          <span className="text-base sm:text-xl">{day}</span>
        </div>
      );
    }

    // 当月天
    for (let day = 1; day <= daysInMonth; day++) {
      const marketDay = isMarketDaySolar(currentYear, currentMonth, day, baseDate, intervalDays);
      const todayIs = isToday(day);

      days.push(
        <div
          key={day}
          className={`
            h-14 sm:h-16 flex flex-col items-center justify-center rounded-2xl text-base font-medium transition-all duration-300 relative no-select
            ${marketDay
              ? 'bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/40 scale-105'
              : todayIs
                ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-400/60'
                : theme === 'dark'
                  ? 'text-slate-300 hover:bg-slate-700/30'
                  : 'text-amber-900 hover:bg-amber-100/50'
            }
            ${todayIs && marketDay
              ? 'ring-4 ring-yellow-300 ring-offset-2 ring-offset-slate-900 scale-110 z-10'
              : ''}
          `}
        >
          {marketDay && (
            <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-full text-slate-900 shadow-md z-10">
              圩
            </div>
          )}
          <span className="text-lg sm:text-2xl font-bold">{day}</span>
          {todayIs && !marketDay && (
            <span className="text-[10px] font-bold opacity-80">今天</span>
          )}
        </div>
      );
    }

    // 下个月补位
    const totalShown = firstDay + daysInMonth;
    const daysToAdd = 7 - (totalShown % 7);
    if (daysToAdd < 7) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      for (let day = 1; day <= daysToAdd; day++) {
        days.push(
          <div key={`next-${day}`}
            className="h-14 sm:h-16 flex flex-col items-center justify-center rounded-2xl text-slate-500 opacity-30"
          >
            <span className="text-base sm:text-xl">{day}</span>
          </div>
        );
      }
    }

    return days;
  };

  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  return (
    <div className="px-2 py-4 relative">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-7">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                : 'text-amber-800 hover:text-amber-900 hover:bg-amber-200/50'
            }`}
          >
            <ChevronLeft size={28} />
          </button>
          <div className="flex items-center gap-2">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-wider ${
              theme === 'dark' ? 'text-white' : 'text-amber-900'
            }`}>
              {currentYear}年 {getMonthName(currentMonth)}
            </h2>
            {!isCurrentMonth && (
              <button
                onClick={goToToday}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  theme === 'dark'
                    ? 'text-rose-400 hover:bg-slate-700/40'
                    : 'text-rose-600 hover:bg-amber-200/50'
                }`}
                title="回到今天"
              >
                <CalendarDays size={20} />
              </button>
            )}
          </div>
          <button onClick={nextMonth}
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                : 'text-amber-800 hover:text-amber-900 hover:bg-amber-200/50'
            }`}
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* 信息栏 + 设置按钮 */}
        <div className={`flex items-center justify-between px-4 py-2 rounded-xl border ${
          theme === 'dark'
            ? 'text-slate-300 bg-slate-800/50 border-slate-700/30'
            : 'text-amber-800 bg-amber-100/60 border-amber-200/50'
        }`}>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-rose-500" />
            <span>{marketDayName} · {intervalDays}天一街</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-200/50'
            }`}
            title="圩日设置"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* 星期 */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 mb-3 sm:mb-4">
        {weekDays.map((day, index) => (
          <div key={day}
            className={`h-8 sm:h-10 flex items-center justify-center text-sm sm:text-base font-bold tracking-wider ${
              index === 0 || index === 6
                ? (theme === 'dark' ? 'text-rose-400' : 'text-rose-600')
                : (theme === 'dark' ? 'text-slate-500' : 'text-amber-600')
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 - 支持触摸滑动 */}
      <div
        ref={gridRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`grid grid-cols-7 gap-1.5 sm:gap-2.5 rounded-xl p-3 touch-pan-y ${
          theme === 'dark' ? 'bg-white/5' : 'bg-amber-50/60'
        }`}
      >
        {renderDays()}
      </div>

      {/* 图例 */}
      <div className={`mt-6 sm:mt-8 pt-5 sm:pt-6 border-t flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-sm sm:text-base ${
        theme === 'dark'
          ? 'border-slate-700/30 text-slate-400'
          : 'border-amber-200/50 text-amber-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 shadow-md shadow-rose-500/40" />
          <span>街日 · {marketDayName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-amber-500/20 ring-2 ring-amber-400/60" />
          <span>今天</span>
        </div>
        <div className="flex items-center gap-2 text-xs opacity-70">
          <span>基准: {baseDate}</span>
          <span>|</span>
          <span>每{intervalDays}天一街</span>
        </div>
      </div>

      {/* 触摸操作提示 */}
      <div className={`mt-3 text-center text-xs opacity-40 ${
        theme === 'dark' ? 'text-slate-400' : 'text-amber-700'
      }`}>
        ← 左右滑动切换月份 →
      </div>

      {/* 设置悬浮面板 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}
        >
          <div className={`w-[90%] max-w-md rounded-2xl p-6 shadow-2xl ${
            theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-amber-900'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Settings size={22} />
                圩日设置
              </h3>
              <button onClick={() => setShowSettings(false)}
                className={`p-1.5 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-amber-100'
                }`}
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-5">
              {/* 街日名称 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">街日名称</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="如：沙塘圩"
                  className={`w-full px-4 py-2.5 rounded-xl border text-base outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-rose-500'
                      : 'bg-amber-50 border-amber-200 text-amber-900 placeholder-amber-400 focus:border-rose-400'
                  }`}
                />
              </div>

              {/* 基准日期 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">基准日期（新历）</label>
                <input
                  type="date"
                  value={tempBaseDate}
                  onChange={(e) => setTempBaseDate(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-base outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-rose-500'
                      : 'bg-amber-50 border-amber-200 text-amber-900 focus:border-rose-400'
                  }`}
                />
                <p className="text-xs mt-1 opacity-60">从这一天开始算街日</p>
              </div>

              {/* 间隔天数 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">间隔天数</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTempInterval(Math.max(1, tempInterval - 1))}
                    className={`w-10 h-10 rounded-xl text-lg font-bold ${
                      theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-amber-100 hover:bg-amber-200'
                    }`}
                  >-</button>
                  <span className="text-2xl font-bold w-12 text-center">{tempInterval}</span>
                  <button
                    onClick={() => setTempInterval(tempInterval + 1)}
                    className={`w-10 h-10 rounded-xl text-lg font-bold ${
                      theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-amber-100 hover:bg-amber-200'
                    }`}
                  >+</button>
                  <span className="text-sm opacity-60">天一街</span>
                </div>
              </div>

              {/* 预览信息 */}
              <div className={`p-3 rounded-xl text-sm ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-amber-50'
              }`}>
                <p className="font-medium mb-1">实时预览</p>
                <p className="opacity-70">
                  {tempName || '圩日'} · 基准 {tempBaseDate} · 每{Math.max(1, tempInterval)}天一街
                </p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSettings(false)}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                取消
              </button>
              <button onClick={saveSettings}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 transition-all shadow-lg"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}