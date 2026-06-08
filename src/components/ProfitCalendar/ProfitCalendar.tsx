import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar, BarChart3, ArrowUpDown, List, Grid } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useThemeStore } from '../../store/themeStore';
import { getMonthName, weekDays } from '../../utils/dateUtils';

type ViewMode = 'month' | 'year';
type SortType = 'date' | 'profit' | 'income' | 'expense';

function formatNumber(num: number): string {
  if (num === Math.floor(num)) {
    return num.toString();
  }
  return num.toFixed(2);
}

function getFontSize(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 10000) return 'text-xs';
  if (abs >= 1000) return 'text-xs sm:text-sm';
  if (abs >= 100) return 'text-sm';
  return 'text-sm sm:text-base';
}

export function ProfitCalendar() {
  const { accounts } = useAppStore();
  const { theme } = useThemeStore();
  const [today] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null);
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentYear, currentMonth]);
  const firstDay = useMemo(() => new Date(currentYear, currentMonth, 1).getDay(), [currentYear, currentMonth]);

  const getDayProfit = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAccounts = accounts.filter((a) => a.date === dateStr);
    const income = dayAccounts.filter((a) => a.type === 'income').reduce((sum, a) => sum + a.amount, 0);
    const expense = dayAccounts.filter((a) => a.type === 'expense').reduce((sum, a) => sum + a.amount, 0);
    return { profit: income - expense, income, expense };
  };

  const getMonthProfit = (year: number, month: number) => {
    const monthAccounts = accounts.filter((a) => {
      const date = new Date(a.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    const income = monthAccounts.filter((a) => a.type === 'income').reduce((sum, a) => sum + a.amount, 0);
    const expense = monthAccounts.filter((a) => a.type === 'expense').reduce((sum, a) => sum + a.amount, 0);
    return { profit: income - expense, income, expense, count: monthAccounts.length };
  };

  const getYearMonthsWithData = () => {
    const monthsWithData: { month: number; profit: number; income: number; expense: number; count: number }[] = [];
    for (let month = 0; month < 12; month++) {
      const data = getMonthProfit(currentYear, month);
      if (data.count > 0) {
        monthsWithData.push({ month, ...data });
      }
    }
    return monthsWithData;
  };

  const getMonthDetails = () => {
    if (!selectedMonth) return [];
    const monthAccounts = accounts.filter((a) => {
      const date = new Date(a.date);
      return date.getFullYear() === selectedMonth.year && date.getMonth() === selectedMonth.month;
    });
    
    return monthAccounts.map((a) => ({
      ...a,
      date: a.date,
      profit: a.type === 'income' ? a.amount : -a.amount,
    })).sort((a, b) => {
      let comparison = 0;
      switch (sortType) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'profit':
          comparison = a.type === 'income' ? a.amount : -a.amount - (b.type === 'income' ? b.amount : -b.amount);
          break;
        case 'income':
          comparison = (a.type === 'income' ? a.amount : 0) - (b.type === 'income' ? b.amount : 0);
          break;
        case 'expense':
          comparison = (a.type === 'expense' ? a.amount : 0) - (b.type === 'expense' ? b.amount : 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const totalYearProfit = useMemo(() => {
    let total = 0;
    for (let month = 0; month < 12; month++) {
      total += getMonthProfit(currentYear, month).profit;
    }
    return total;
  }, [currentYear]);

  const currentMonthData = useMemo(() => getMonthProfit(currentYear, currentMonth), [currentYear, currentMonth]);

  const monthDetails = useMemo(() => getMonthDetails(), [selectedMonth, sortType, sortOrder]);

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

  const prevYear = () => setCurrentYear(currentYear - 1);
  const nextYear = () => setCurrentYear(currentYear + 1);

  const toggleSort = (type: SortType) => {
    if (sortType === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(type);
      setSortOrder('desc');
    }
  };

  const renderMonthView = () => {
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`prev-${i}`} className="h-14 sm:h-16 flex flex-col items-center justify-center rounded-xl" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const { profit } = getDayProfit(currentYear, currentMonth, day);
      const todayIs = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      const isPositive = profit > 0;
      const isNegative = profit < 0;
      const fontSize = getFontSize(profit);

      days.push(
        <div
          key={day}
          className={`h-14 sm:h-16 flex flex-col items-center justify-center rounded-xl transition-all duration-300 relative cursor-pointer
            ${isPositive ? 'bg-rose-500/10' : isNegative ? 'bg-emerald-500/10' : ''}
            ${todayIs ? 'bg-rose-500/80' : ''}
          `}
        >
          <span className={`text-base font-bold ${
            todayIs ? 'text-white' : (isPositive ? 'text-rose-500' : isNegative ? 'text-emerald-500' : 'text-slate-400')
          }`}>
            {todayIs ? '今' : day}
          </span>
          <div className="flex items-center gap-0.5">
            {isPositive ? <TrendingUp size={12} className="text-rose-500" /> : isNegative ? <TrendingDown size={12} className="text-emerald-500" /> : null}
            <span className={`font-semibold ${fontSize} ${
              todayIs ? 'text-white' : (isPositive ? 'text-rose-500' : isNegative ? 'text-emerald-500' : 'text-slate-400')
            }`}>
              {isPositive ? '+' : ''}{formatNumber(profit)}
            </span>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-3">
          {weekDays.map((day, index) => (
            <div key={day} className={`h-7 flex items-center justify-center text-xs font-bold ${
              index === 0 || index === 6 ? 'text-rose-500' : 'text-slate-500'
            }`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">{days}</div>
      </>
    );
  };

  const renderYearView = () => {
    const monthsWithData = getYearMonthsWithData();
    const currentMonthIndex = today.getMonth();
    const isCurrentYear = currentYear === today.getFullYear();

    return (
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {monthsWithData.map(({ month, profit }) => {
          const isCurrentMonth = isCurrentYear && month === currentMonthIndex;
          const isPositive = profit > 0;
          const fontSize = getFontSize(profit);

          return (
            <div
              key={month}
              onClick={() => {
                setSelectedMonth({ year: currentYear, month });
                setViewMode('month');
                setCurrentMonth(month);
              }}
              className={`h-20 sm:h-24 flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-pointer
                ${isPositive ? 'bg-rose-500/10' : 'bg-emerald-500/10'}
                ${isCurrentMonth ? 'bg-rose-500/80 ring-2 ring-rose-400' : ''}
              `}
            >
              <span className={`text-sm font-bold ${isCurrentMonth ? 'text-white' : (isPositive ? 'text-rose-500' : 'text-emerald-500')}`}>
                {month + 1}月
              </span>
              <div className="flex items-center gap-0.5">
                {isPositive ? <TrendingUp size={12} className={isCurrentMonth ? 'text-white' : 'text-rose-500'} /> : <TrendingDown size={12} className={isCurrentMonth ? 'text-white' : 'text-emerald-500'} />}
                <span className={`font-semibold ${fontSize} ${isCurrentMonth ? 'text-white' : (isPositive ? 'text-rose-500' : 'text-emerald-500')}`}>
                  {isPositive ? '+' : ''}{formatNumber(profit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="px-2 py-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
          <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-900'}`}>收益分布</h1>
        </div>
        <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'month' ? 'bg-white text-slate-900' : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            月
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'year' ? 'bg-white text-slate-900' : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            年
          </button>
        </div>
      </div>

      {/* Month/Year selector */}
      <div className="flex items-center justify-between">
        <button
          onClick={viewMode === 'month' ? prevMonth : prevYear}
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          {viewMode === 'month' ? (
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-900'}`}>
              {currentYear}年 {getMonthName(currentMonth)}
            </h2>
          ) : (
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-900'}`}>
              {currentYear}年
            </h2>
          )}
          {viewMode === 'month' && (
            <div className="flex items-center justify-center gap-4 mt-1 text-sm">
              <span className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>收入 ¥{formatNumber(currentMonthData.income)}</span>
              <span className="text-slate-500">|</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>支出 ¥{formatNumber(currentMonthData.expense)}</span>
              <span className="text-slate-500">|</span>
              <span className={currentMonthData.profit >= 0 ? 'text-rose-500' : 'text-emerald-500'}>
                利润 {currentMonthData.profit >= 0 ? '+' : ''}¥{formatNumber(currentMonthData.profit)}
              </span>
            </div>
          )}
          {viewMode === 'year' && (
            <div className="mt-1 text-sm text-center">
              <span className={totalYearProfit >= 0 ? 'text-rose-500' : 'text-emerald-500'}>
                年利润 {totalYearProfit >= 0 ? '+' : ''}¥{formatNumber(totalYearProfit)}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={viewMode === 'month' ? nextMonth : nextYear}
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Calendar/Year grid */}
      <div className="bg-white/5 rounded-xl p-3">
        {viewMode === 'month' ? renderMonthView() : renderYearView()}
      </div>

      {/* Month details */}
      {selectedMonth && monthDetails.length > 0 && (
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-amber-900'}`}>
                当月收益明细 ({selectedMonth.year}.{String(selectedMonth.month + 1).padStart(2, '0')})
              </span>
            </div>
            <button
              onClick={() => setSelectedMonth(null)}
              className={`text-sm ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              收起
            </button>
          </div>
          
          {/* Sort options */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            {[
              { type: 'date' as SortType, label: '日期' },
              { type: 'profit' as SortType, label: '盈亏' },
              { type: 'income' as SortType, label: '收入' },
              { type: 'expense' as SortType, label: '支出' },
            ].map(({ type, label }) => (
              <button
                key={type}
                onClick={() => toggleSort(type)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  sortType === type
                    ? 'bg-amber-500 text-white'
                    : theme === 'dark'
                    ? 'bg-slate-700/50 text-slate-400 hover:text-white'
                    : 'bg-amber-100/50 text-amber-700 hover:bg-amber-200'
                }`}
              >
                {label}
                {sortType === type && <ArrowUpDown size={14} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
              </button>
            ))}
          </div>
          
          {/* Details list */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {monthDetails.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.type === 'income' ? 'bg-rose-500/10' : 'bg-emerald-500/10'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${item.type === 'income' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {item.category}
                    </span>
                    {item.subCategory && (
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-slate-600 text-slate-300`}>
                        {item.subCategory}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{item.date}</span>
                </div>
                <span className={`font-bold ${item.type === 'income' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {item.type === 'income' ? '+' : '-'}¥{formatNumber(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
