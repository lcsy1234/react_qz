# 左侧菜单 + React Flow Demo 设计

## 目标

为 `react_qz` 增加 Ant Design 左侧菜单布局，并新增基于 React Flow Quick Start 的最小 Demo 页。

## 范围

**做：**

- `App` 使用 `Layout` + 左侧 `Sider`/`Menu` + 右侧 `Content`
- 菜单三项：`用户管理` / `事务演示` / `React Flow Demo`
- `useState` 切换页面（不引入 react-router）
- 新增 `FlowDemoPage`：`@xyflow/react` 两节点 + 一边，可拖拽
- 去掉页内「跳转事务演示 / 返回」按钮（改由侧栏切换）

**不做：**

- 路由、URL 同步
- MiniMap / Controls / Background 等增强组件
- 自定义节点/边

## 布局

```
┌────────┬──────────────────────┐
│ Sider  │ Content              │
│ Menu   │ 当前页面             │
│        │                      │
└────────┴──────────────────────┘
```

- 全高布局；Sider 宽约 200px
- 默认选中「用户管理」
- Content 内按 `page` 渲染对应组件

## 页面与导航

| key | 菜单文案 | 组件 |
|-----|----------|------|
| `user` | 用户管理 | `UserPage` |
| `transaction` | 事务演示 | `TransactionDemoPage` |
| `flow` | React Flow Demo | `FlowDemoPage`（新建） |

- `UserPage`：移除 `onOpenTransactionDemo` 及相关按钮
- `TransactionDemoPage`：移除 `onBack` 及相关返回按钮

## FlowDemoPage

按 [React Flow Quick Start](https://reactflow.dev/learn)：

- 依赖：`@xyflow/react` + 官方 CSS
- 父容器需有明确宽高（占满 Content 区域）
- `useState` + `applyNodeChanges` / `applyEdgeChanges` / `addEdge`
- 初始：两节点、一条边，`fitView`

## 文件改动

| 文件 | 变更 |
|------|------|
| `package.json` | 增加 `@xyflow/react` |
| `src/App.tsx` | Layout + Menu + 页面切换 |
| `src/pages/FlowDemoPage.tsx` | 新建 |
| `src/pages/UserPage.tsx` | 去掉跨页跳转 props/按钮 |
| `src/pages/TransactionDemoPage.tsx` | 去掉返回 props/按钮 |

## 验收

1. 左侧可见三项菜单，点击切换右侧内容
2. 用户管理、事务演示功能与改前一致（仅导航方式变）
3. React Flow Demo 可拖节点、可连线
