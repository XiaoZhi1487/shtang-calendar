# 技术架构文档

## 1. 架构设计

```
┌─────────────────────────────────────────┐
│              前端应用                     │
├─────────────────────────────────────────┤
│  React + TypeScript + Vite + TailwindCSS │
│  ┌─────────────────────────────────────┐│
│  │           页面组件层                   ││
│  │  Calendar | AccountBook | Table | Diary │
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │           状态管理层                  ││
│  │         Zustand Store               ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │           导航层                     ││
│  │       React Router                  ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## 2. 技术选型

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: TailwindCSS
- **状态管理**: Zustand
- **路由**: React Router DOM v6
- **图标**: Lucide React

## 3. 路由定义

| 路由 | 页面 | 描述 |
|-----|------|-----|
| / | CalendarPage | 日历页面（默认首页） |
| /account | AccountBookPage | 记账本页面 |
| /table | TablePage | 表格功能页面 |
| /diary | DiaryPage | 日记功能页面 |

## 4. 组件结构

```
src/
├── components/
│   ├── Calendar/
│   │   └── Calendar.tsx          # 日历主体组件
│   ├── AccountBook/
│   │   └── AccountBook.tsx       # 记账本组件
│   ├── Table/
│   │   └── DataTable.tsx         # 表格组件
│   ├── Diary/
│   │   └── Diary.tsx             # 日记组件
│   └── Layout/
│       ├── Navbar.tsx            # 底部导航栏
│       └── PageContainer.tsx     # 页面容器
├── pages/
│   ├── CalendarPage.tsx
│   ├── AccountBookPage.tsx
│   ├── TablePage.tsx
│   └── DiaryPage.tsx
├── store/
│   └── useAppStore.ts            # Zustand 状态管理
├── utils/
│   └── dateUtils.ts              # 日期工具函数
├── App.tsx
├── main.tsx
└── index.css
```

## 5. 数据模型

### 5.1 记账记录 (AccountEntry)
```typescript
interface AccountEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note?: string;
  date: string; // YYYY-MM-DD
}
```

### 5.2 表格行 (TableRow)
```typescript
interface TableRow {
  id: string;
  [key: string]: string | number;
}
```

### 5.3 日记条目 (DiaryEntry)
```typescript
interface DiaryEntry {
  date: string; // YYYY-MM-DD
  content: string;
}
```

## 6. 日历高亮逻辑

### 6.1 "1001001" 模式说明
- 模式：1 = 高亮，0 = 不高亮
- 周期：每3天一个循环
- 高亮日：每月第1、4、7、10、13、16...天

### 6.2 算法
```typescript
function isHighlighted(dayOfMonth: number): boolean {
  // (day - 1) % 3 === 0 表示第1、4、7、10...天
  return (dayOfMonth - 1) % 3 === 0;
}
```
