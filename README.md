# 🌾 沙塘圩日历 / Shtang Market Calendar

欢迎来到这款面向沙塘圩经营者的轻量化工具应用。它把“圩日提醒 + 记账记录 + 收益统计”整合在一起，帮助你更轻松地安排生意与日常管理。

Welcome to this lightweight tool for market traders in Shtang. It combines market-day reminders, bookkeeping, and profit tracking in one place to help you manage your business more easily.

---

## ✨ 这是什么 / What is this?

### 中文
这是一款基于 React + TypeScript + Vite 的移动友好应用，主要面向沙塘圩的摊贩、商户和经营者。

它包含三大核心能力：
- 查看圩日日历，快速了解哪天适合进货、摆摊或出门经营
- 记录收入与支出，方便日常记账
- 查看收益分布与利润走势，辅助经营分析

### English
This is a mobile-friendly app built with React + TypeScript + Vite, designed for market vendors and shopkeepers in Shtang.

It focuses on three core capabilities:
- View market-day calendar information to plan buying, selling, or operating days
- Record income and expenses for daily bookkeeping
- Analyze profit distribution and trends for business insights

---

## 🌟 主要功能 / Key Features

- 📅 圩日日历：展示沙塘圩的市场日安排，直观识别圩日
- 💸 记账本：支持收入/支出记录、分类、数量、备注等
- 📈 收益分析：按月/按年查看利润变化与明细
- 🔐 账号登录：支持账号登录与云端同步（后端 API）
- 🌙 深浅主题：适配不同使用场景的视觉体验
- 📱 跨端能力：可进一步打包为 Android 应用

- 📅 Market Calendar: Shows market-day information for Shtang
- 💸 Account Book: Supports income/expense entries, categories, quantity, and notes
- 📈 Profit Analysis: View monthly and yearly profit trends and details
- 🔐 Account Login: Supports login and cloud sync through backend API
- 🌙 Dark/Light Theme: Provides a better visual experience in different environments
- 📱 Cross-platform Ready: Can be packaged as an Android app

---

## 🛠️ 技术栈 / Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- State & Routing: Zustand, React Router
- UI Icons: lucide-react
- Backend API: Express + MySQL + JWT + bcrypt
- Mobile Packaging: Capacitor

- 前端：React、TypeScript、Vite、Tailwind CSS
- 状态管理与路由：Zustand、React Router
- 图标库：lucide-react
- 后端接口：Express + MySQL + JWT + bcrypt
- 移动打包：Capacitor

---

## 可直接下载安卓应用
/version目录下的apk文件即可直接安装

---

## 🚀 快速开始 / Quick Start

### 1) 安装依赖
npm install

### 2) 启动前端开发服务器
npm run dev

### 3) 启动后端 API（如需登录/记账同步）
node server.js

### 4) 构建正式版本
npm run build

### 1) Install dependencies
npm install

### 2) Start the frontend dev server
npm run dev

### 3) Start the backend API (for login and bookkeeping sync)
node server.js

### 4) Build for production
npm run build

---

## 📦 常用命令 / Useful Commands

- npm run dev：启动开发环境
- npm run build：构建生产包
- npm run preview：预览构建结果
- npm run check：TypeScript 检查
- npm run lint：代码检查

- npm run dev：Start development server
- npm run build：Build production bundle
- npm run preview：Preview the built app
- npm run check：TypeScript check
- npm run lint：Run linter

---

## 📱 Android 打包建议 / Android Packaging Notes

如果你想把它打包成 Android 应用，可以先构建前端，再同步 Capacitor 资源：

npm run build
npx cap sync android

Then open the Android project in Android Studio or run Gradle build.

---

## 🧭 项目定位 / Project Purpose

这不是一个普通的日历模板，而是一款贴近真实经营场景的“市场经营助手”。

It is not just a calendar template — it is a practical business helper tailored for real market operations.

如果你是第一次查看这个仓库，建议先从以下路径了解核心页面：
- src/components/Calendar/Calendar.tsx：圩日日历
- src/components/AccountBook/AccountBook.tsx：记账本
- src/components/ProfitCalendar/ProfitCalendar.tsx：收益分析
- server.js：后端 API 与数据接口

If you are new to this repository, start with these key areas:
- src/components/Calendar/Calendar.tsx: Market-day calendar
- src/components/AccountBook/AccountBook.tsx: Account book
- src/components/ProfitCalendar/ProfitCalendar.tsx: Profit analysis
- server.js: Backend API and data services

---

## ✅ 简短结语 / Short Summary

这是一款适合“看圩日、记生意、看利润”的实用工具。

This is a practical tool for checking market days, recording business activity, and tracking profit.
