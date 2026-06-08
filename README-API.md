# 沙塘圩日历 - API 服务使用说明

## 📋 项目概述

这是沙塘圩日历的完整技术实现，包括：
- 前端：React + TypeScript + Vite
- 后端：Node.js + Express + MySQL
- 数据库：SQLPub 云数据库（免费）

---

## 🚀 快速开始

### 1. 启动 API 服务器

```bash
cd e:\Allcode\shtang-calendar\archive2
node server.js
```

服务器将在 `http://localhost:3000` 启动

### 2. 启动前端开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:5173` 启动

---

## 📊 数据库信息

| 项目 | 值 |
|------|-----|
| 主机 | mysql6.sqlpub.com:3311 |
| 数据库名 | shatang_userdata |
| 用户名 | xiaott |
| 密码 | b1y6ukxRrVGopQH7 |

### 已创建的表

| 表名 | 说明 |
|------|------|
| users | 用户表（手机号+密码） |
| accounts | 记账表 |
| diaries | 日记表 |
| app_version | 版本表 |

---

## 🔧 常用命令

### 添加新版本

```bash
node add-version.js <版本号> <下载链接> [更新说明]
```

示例：
```bash
node add-version.js 1.0.1 https://your-domain.com/app.apk "新增了收益明细功能"
```

### 查看数据库状态

```bash
node check-database.js
```

### 初始化数据库（如果需要重新初始化）

```bash
node setup-database.js
```

---

## 🌐 API 接口文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/register | 注册新用户 |
| POST | /api/login | 登录 |

### 版本检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/version/latest | 获取最新版本信息 |

### 记账接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/accounts | 获取记账列表（需要登录） |
| POST | /api/accounts | 添加记账（需要登录） |

### 日记接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/diaries | 获取日记列表（需要登录） |
| POST | /api/diaries | 添加日记（需要登录） |

### 数据同步

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/sync/upload | 上传数据（需要登录） |
| GET | /api/sync/download | 下载数据（需要登录） |

---

## 📱 打包 APK

### 1. 构建前端

```bash
npm run build
npx cap sync android
```

### 2. 用 Android Studio 打包

1. 打开项目的 `android` 文件夹
2. 等待 Gradle 同步完成
3. 点击 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
4. APK 将输出到：`android/app/build/outputs/apk/debug/`

---

## 🔄 更新流程

### 发布新版本步骤：

1. **修改代码** - 在前端/后端做修改
2. **测试** - 本地测试功能
3. **构建 APK** - 用 Android Studio 打包
4. **上传 APK** - 把 APK 上传到某个地方（云存储/你的服务器）
5. **添加版本记录** - 用命令添加到数据库：

```bash
node add-version.js 1.0.2 https://your-apk-url.apk "新功能说明"
```

6. **用户收到提示** - App 启动时会自动检查并提示更新

---

## 💡 部署建议

### 免费部署选项（按推荐顺序）：

1. **Railway** - 免费额度足够
2. **Render** - 免费额度够用
3. **Vercel** - 适合前端，后端需要用 Serverless
4. **GitHub Actions + Pages** - 适合静态文件

### 免费存储 APK：

1. **GitHub Releases** - 免费，但国内访问慢
2. **七牛云** - 免费额度 10GB
3. **阿里云 OSS** - 免费额度 10GB
4. **蓝奏云** - 完全免费，但限速

---

## 📝 配置说明

### 修改 API 地址

在 `src/store/userStore.ts` 中修改：

```typescript
const API_BASE = 'http://your-server.com/api';
```

---

## 🆘 常见问题

### Q: 我需要公网服务器吗？
A: 如果要在手机上用，需要公网服务器。建议用 Railway 等免费 PaaS。

### Q: 数据安全吗？
A: 现在是演示版，生产环境需要：
- 加强密码加密密钥
- 添加 HTTPS
- 添加 API 限流
- 定期备份数据库

### Q: 如何备份数据库？
A: 可以用 mysqldump 命令，或者用 SQLPub 的导出功能。

---

## 📞 技术支持

如有问题，查看：
1. 后端控制台日志
2. 浏览器开发者工具
3. 数据库连接状态
