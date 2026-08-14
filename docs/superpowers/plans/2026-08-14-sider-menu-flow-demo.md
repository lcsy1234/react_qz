# Sider Menu + React Flow Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 左侧 Ant Design 菜单切换三个页面，并新增 React Flow Quick Start 最小 Demo。

**Architecture:** `App` 用 `Layout` + `Sider`/`Menu` + `Content`，`useState` 切换 `user` | `transaction` | `flow`；不引入路由。

**Tech Stack:** React 19、Ant Design 5、Vite、`@xyflow/react`

## Global Constraints

- 不引入 react-router
- Flow 页仅 Quick Start：两节点 + 一边，不加 MiniMap/Controls/Background
- 去掉页内跨页跳转按钮

---

### Task 1: 安装依赖并新建 FlowDemoPage

**Files:**
- Create: `react_qz/src/pages/FlowDemoPage.tsx`
- Modify: `react_qz/package.json`（via npm install）

- [ ] **Step 1: 安装 `@xyflow/react`**

```bash
cd react_qz && npm install @xyflow/react
```

- [ ] **Step 2: 创建 FlowDemoPage**

按官方 Quick Start 实现两节点 + 一边，父容器 `width/height: 100%`。

- [ ] **Step 3: 目视确认文件可编译**（随 Task 3 一起 `npm run build`）

---

### Task 2: 清理页内跳转

**Files:**
- Modify: `react_qz/src/pages/UserPage.tsx`
- Modify: `react_qz/src/pages/TransactionDemoPage.tsx`

- [ ] **Step 1:** 移除 `UserPage` 的 `onOpenTransactionDemo` props 与「事务场景 Demo」按钮
- [ ] **Step 2:** 移除 `TransactionDemoPage` 的 `onBack` props 与「返回用户管理」按钮

---

### Task 3: App 左侧菜单布局

**Files:**
- Modify: `react_qz/src/App.tsx`

- [ ] **Step 1:** 用 `Layout`/`Sider`/`Menu`/`Content` 包住三页，菜单 key：`user` / `transaction` / `flow`
- [ ] **Step 2:** `npm run build` 通过

## Spec Coverage

| Spec 项 | Task |
|---------|------|
| Layout + Sider Menu | Task 3 |
| 三菜单项 | Task 3 |
| FlowDemoPage Quick Start | Task 1 |
| 去掉页内跳转 | Task 2 |
| 安装 @xyflow/react | Task 1 |
