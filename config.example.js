// ============================================================
// 服务器配置文件模板 - 填写后另存为 config.js
// ------------------------------------------------------------
// 部署步骤：
//   1. 将本文件复制一份，重命名为 config.js
//   2. 在 config.js 中填入你的真实配置
//   3. 运行服务器：node server.js
//
// 注意：为保护开发者数据库安全，config.js 已被 .gitignore 排除，不会上传到 GitHub，您可填写真实配置后修改为 config.js
// 数据库功能可以让app使用登录功能保存用户数据，包括用户信息、日历事件等。
// ============================================================

export const config = {
  // ---- 服务器端口 ----
  PORT: process.env.PORT || 3000,

  // ---- MySQL 数据库配置 ----
  database: {
    host: 'your-mysql-host.com',        // 数据库服务器地址
    port: 3306,                          // MySQL 端口，默认 3306
    user: 'your_username',               // 数据库用户名
    password: 'your_password',           // 数据库密码
    database: 'your_database',           // 数据库名称
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 15000,
  },

  // ---- JWT 密钥（用于登录 Token 的签名，请改为随机长字符串）----
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-to-a-random-string',

  // ---- 发布新版本的验证秘钥（用于 /api/version/add 接口）----
  // 可自定义，用于 /工具/发布新版本.html 发布新版本时验证发布秘钥
  PUBLISH_SECRET: process.env.PUBLISH_SECRET || 'your-publish-secret',
};
