import { Solar } from 'lunar-typescript';

// 获取本地日期字符串 (YYYY-MM-DD)，避免时区问题
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 将日期转为 YYYY-MM-DD 格式的数字值（方便计算差值）
 */
export function dateToValue(year: number, month: number, day: number): number {
  return new Date(year, month, day).getTime();
}

/**
 * 计算两个日期之间的天数差
 */
export function daysBetween(
  y1: number, m1: number, d1: number,
  y2: number, m2: number, d2: number
): number {
  const t1 = new Date(y1, m1, d1).getTime();
  const t2 = new Date(y2, m2, d2).getTime();
  return Math.round((t1 - t2) / (1000 * 60 * 60 * 24));
}

/**
 * 判断某天是否为街日（新历，基于基准日和间隔天数）
 * @param baseDate 基准日期 YYYY-MM-DD
 * @param intervalDays 间隔天数（如3表示每3天一街）
 */
export function isMarketDaySolar(
  year: number, month: number, day: number,
  baseDate: string,
  intervalDays: number
): boolean {
  try {
    const [bY, bM, bD] = baseDate.split('-').map(Number);
    const diff = daysBetween(year, month, day, bY, bM - 1, bD);
    return diff >= 0 && diff % intervalDays === 0;
  } catch {
    return false;
  }
}

// 沙塘圩日（旧版农历算法，保留兼容）
export function isMarketDay(year: number, month: number, day: number): boolean {
  try {
    const solar = Solar.fromYmd(year, month + 1, day);
    const lunar = solar.getLunar();
    const lunarDay = lunar.getDay();
    return (lunarDay - 1) % 3 === 0;
  } catch {
    return false;
  }
}

export function getLunarDay(year: number, month: number, day: number): string {
  try {
    const solar = Solar.fromYmd(year, month + 1, day);
    const lunar = solar.getLunar();
    return lunar.getDayInChinese();
  } catch {
    return '';
  }
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function getMonthName(month: number): string {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  return months[month];
}

export const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
