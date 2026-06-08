
// API 配置
// 你可以在这里修改你的后端服务器地址
// 如果你部署到了公网服务器，把下面的地址改成你的服务器地址

// 开发环境使用本地地址
const DEV_API_BASE = 'http://localhost:3000/api';

// 生产环境 - 如果你部署到了公网服务器，请改成你的服务器地址
// 例如：'https://your-domain.com/api'
const PROD_API_BASE = 'https://shtang-calendar.onrender.com/api';

// 根据环境自动选择
export const API_BASE = import.meta.env.DEV ? DEV_API_BASE : PROD_API_BASE;

console.log('🌐 API 地址:', API_BASE);

