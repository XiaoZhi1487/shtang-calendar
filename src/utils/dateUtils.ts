import { Solar } from 'lunar-typescript';

// 获取本地日期字符串 (YYYY-MM-DD)，避免时区问题
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 沙塘圩日：农历初一、初四、初七、初十、十三、十六、十九、廿二、廿五、廿八
export function isMarketDay(year: number, month: number, day: number): boolean {
  try {
    const solar = Solar.fromYmd(year, month + 1, day);
    const lunar = solar.getLunar();
    const lunarDay = lunar.getDay();
    return (lunarDay - 1) % 3 === 0; // 每3天一圩：1,4,7,10...
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
