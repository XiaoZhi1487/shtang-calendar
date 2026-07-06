// API 配置
// 优先读取环境变量 VITE_API_BASE，否则使用默认线上地址
const ENV_API = typeof import.meta !== 'undefined' ? import.meta.env.VITE_API_BASE as string : '';
const RENDER_API_BASE = 'https://shtang-calendar.onrender.com/api';

export const API_BASE = ENV_API || RENDER_API_BASE;