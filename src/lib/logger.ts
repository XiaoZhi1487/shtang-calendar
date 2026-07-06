// 生产环境下的安全日志工具
// 非 debug 模式下抑制 console.log 输出，但保留 console.error
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';

export const logger = {
  log: (...args: any[]) => { if (DEBUG) console.log(...args); },
  info: (...args: any[]) => { if (DEBUG) console.info(...args); },
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
};