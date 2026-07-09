# React 用户管理测试页设计

## 目标

在 `react_qz` 用 Vite + React + TypeScript + Ant Design 做一个用户管理业务页，对接 `go_demo` 后端 User API，方便本地测接口与操作真实数据。

- 本地路径：`/Users/yqsl/Documents/study/qz_study/react_qz`
- GitHub 仓库：https://github.com/lcsy1234/react_qz

## 技术栈

| 项 | 选择 |
|----|------|
| 打包 | Vite |
| UI | React 19 + TypeScript |
| 组件库 | Ant Design 5 |
| HTTP | 原生 `fetch`（薄封装） |
| 后端 | `http://localhost:8000`（GoFrame） |

## 代理与请求路径

- Vite `server.proxy`：`/api` → `http://localhost:8000`
- 前端请求前缀：`/api`（例如 `/api/user/list`）
- 不在页面上配置 Base URL，不使用 `.env` 切换环境

## 页面形态

单页用户管理（不做路由拆分）：

1. 顶部标题 +「新建用户」按钮
2. Ant Design `Table` 展示用户列表，支持分页
3. 行操作：编辑、删除（删除用 `Popconfirm`）
4. 新建 / 编辑共用 `Modal` + `Form`
5. 成功 / 失败用 `message` 提示，操作后刷新列表

### 表格字段

| 列 | 来源 |
|----|------|
| ID | `id` |
| 姓名 | `name` |
| 年龄 | `age` |
| 身高(cm) | `height` |
| 创建时间 | `createdAt` |
| 操作 | 编辑 / 删除 |

### 表单字段与校验

| 字段 | 规则（与后端一致） |
|------|-------------------|
| `name` | 必填，长度 1–64 |
| `age` | 必填，0–150 整数 |
| `height` | 必填，50–250 数字 |

## 对接接口

后端统一响应：`{ code: number, message: string, data: T }`，`code === 0` 为成功。

| 操作 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 分页列表 | GET | `/user/list?page=&size=` | `data: { list, total }` |
| 新建 | POST | `/user` | body: `{ name, age, height }`，`data: { id }` |
| 更新 | PUT | `/user/{id}` | body: `{ name, age, height }` |
| 删除 | DELETE | `/user/{id}` | 无 body |

不调用：`GET /user/{id}`、`GET /user/all`、`/hello`、`/test`。

## 目录结构

```
react_qz/
  docs/superpowers/specs/   # 本设计文档
  src/
    api/http.ts             # fetch 封装，解析 GoFrame 响应
    api/user.ts             # 用户 CRUD API
    types/user.ts           # User / 请求响应类型
    pages/UserPage.tsx      # 列表 + Modal 表单
    App.tsx
    main.tsx
  vite.config.ts            # proxy: /api -> :8000
  package.json
  tsconfig.json
  index.html
```

## 错误处理

- HTTP 非 2xx：提示网络/服务错误
- `code !== 0`：展示后端 `message`
- 删除失败、表单提交失败：不关闭 Modal / 不误刷新成功态

## 范围

**做：**

- 脚手架（Vite React TS）
- Ant Design 用户列表 / 新建 / 编辑 / 删除
- Vite 代理与 API 封装

**不做：**

- `/hello`、`/test` 页面
- 登录鉴权
- 多路由 / 独立表单页
- 详情抽屉（列表字段已够用）
- 单元测试（以手动测接口为主）

## 本地运行

1. 后端：`go_demo` 服务监听 `:8000`
2. 前端：`cd react_qz && npm install && npm run dev`
3. 浏览器打开 Vite 提示的本地地址（通常 `http://localhost:5173`）
