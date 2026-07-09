# 用户管理测试页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 Vite + React 19 + TypeScript + Ant Design 5 搭建单页用户管理，对接 GoFrame 后端 `localhost:8000` 的 User CRUD API。

**Architecture:** Vite 将 `/api` 代理到后端；`src/api/http.ts` 薄封装 `fetch` 并解析 `{ code, message, data }`；`src/api/user.ts` 提供列表/新建/更新/删除；`UserPage` 用 Table + Modal Form 完成全部交互。规格明确不做单元测试，以手动联调验证。

**Tech Stack:** Vite、React 19、TypeScript、Ant Design 5、原生 fetch

---

## File Structure

```
react_qz/
  index.html
  package.json
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  vite.config.ts
  src/
    main.tsx
    App.tsx
    vite-env.d.ts
    types/user.ts
    api/http.ts
    api/user.ts
    pages/UserPage.tsx
```

---

### Task 1: Vite React TypeScript 脚手架

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`

- [ ] **Step 1: 用官方模板初始化项目（保留已有 docs/）**

在 `react_qz` 目录执行（仓库根已有 `.git` 与 `docs/`，不要覆盖它们）：

```bash
cd /Users/yqsl/Documents/study/qz_study/react_qz
npm create vite@latest . -- --template react-ts
```

若提示目录非空，选择继续 / 覆盖脚手架文件，但确认不要删除 `docs/`。

若 `create-vite` 因非空目录失败，改为手动创建下列文件（与官方模板等价）：

`package.json`:
```json
{
  "name": "react_qz",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "antd": "^5.26.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.5.0",
    "typescript": "~5.8.3",
    "vite": "^6.3.5"
  }
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

`tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

`index.html`:
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>用户管理</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
```

`src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.tsx`:
```tsx
function App() {
  return <div>用户管理</div>
}

export default App
```

- [ ] **Step 2: 安装依赖**

```bash
cd /Users/yqsl/Documents/study/qz_study/react_qz
npm install
npm install antd
```

若用 `create-vite` 成功，再执行 `npm install antd`。若已手动写好含 antd 的 `package.json`，一次 `npm install` 即可。

Expected: `node_modules/` 存在，无报错。

- [ ] **Step 3: 确认 Vite 代理配置**

打开 `vite.config.ts`，确保包含：

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
},
```

若脚手架生成的配置没有 proxy，按上面补全。

- [ ] **Step 4: 启动开发服务器验证脚手架**

```bash
npm run dev
```

Expected: 终端输出本地地址（如 `http://localhost:5173`），浏览器打开可见「用户管理」。

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html src/
git commit -m "$(cat <<'EOF'
chore: scaffold Vite React TypeScript with Ant Design and API proxy

EOF
)"
```

---

### Task 2: 类型与 HTTP / User API 封装

**Files:**
- Create: `src/types/user.ts`
- Create: `src/api/http.ts`
- Create: `src/api/user.ts`

- [ ] **Step 1: 创建用户类型**

`src/types/user.ts`:
```ts
export interface User {
  id: number
  name: string
  age: number
  height: number
  createdAt: string
  updatedAt?: string
}

export interface UserFormValues {
  name: string
  age: number
  height: number
}

export interface UserListResult {
  list: User[]
  total: number
}

export interface CreateUserResult {
  id: number
}
```

- [ ] **Step 2: 创建 fetch 封装**

`src/api/http.ts`:
```ts
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export class ApiError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!res.ok) {
    throw new ApiError(res.status, `网络/服务错误 (${res.status})`)
  }

  const body = (await res.json()) as ApiResponse<T>
  if (body.code !== 0) {
    throw new ApiError(body.code, body.message || '请求失败')
  }

  return body.data
}
```

- [ ] **Step 3: 创建用户 API**

`src/api/user.ts`:
```ts
import { request } from './http'
import type { CreateUserResult, UserFormValues, UserListResult } from '../types/user'

export function fetchUserList(page: number, size: number) {
  const qs = new URLSearchParams({
    page: String(page),
    size: String(size),
  })
  return request<UserListResult>(`/user/list?${qs.toString()}`)
}

export function createUser(data: UserFormValues) {
  return request<CreateUserResult>('/user', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateUser(id: number, data: UserFormValues) {
  return request<null>(`/user/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteUser(id: number) {
  return request<null>(`/user/${id}`, {
    method: 'DELETE',
  })
}
```

- [ ] **Step 4: 手动验证 API（后端需已在 :8000 运行）**

在浏览器控制台或临时脚本中不必强制；本步用 curl 经代理验证更稳妥。先确保 `npm run dev` 在跑，另开终端：

```bash
curl -s "http://localhost:5173/api/user/list?page=1&size=10"
```

Expected: JSON 形如 `{"code":0,"message":"...","data":{"list":[...],"total":N}}`（或空列表）。若失败，检查后端是否监听 `:8000`、proxy rewrite 是否去掉 `/api`。

- [ ] **Step 5: Commit**

```bash
git add src/types/user.ts src/api/http.ts src/api/user.ts
git commit -m "$(cat <<'EOF'
feat: add user types and API client with GoFrame response parsing

EOF
)"
```

---

### Task 3: UserPage 列表 + 分页

**Files:**
- Create: `src/pages/UserPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 实现列表页骨架（含加载与分页）**

`src/pages/UserPage.tsx`:
```tsx
import { useCallback, useEffect, useState } from 'react'
import { Button, Space, Table, Typography, message } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { fetchUserList } from '../api/user'
import { ApiError } from '../api/http'
import type { User } from '../types/user'

const { Title } = Typography

export default function UserPage() {
  const [list, setList] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)

  const loadList = useCallback(async (p = page, s = pageSize) => {
    setLoading(true)
    try {
      const data = await fetchUserList(p, s)
      setList(data.list ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '加载失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    void loadList(page, pageSize)
  }, [page, pageSize, loadList])

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name' },
    { title: '年龄', dataIndex: 'age', width: 80 },
    { title: '身高(cm)', dataIndex: 'height', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', width: 200 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: () => (
        <Space>
          <Button type="link" disabled>
            编辑
          </Button>
          <Button type="link" danger disabled>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const onTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1)
    setPageSize(pagination.pageSize ?? 10)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          用户管理
        </Title>
        <Button type="primary" disabled>
          新建用户
        </Button>
      </div>

      <Table<User>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
        onChange={onTableChange}
      />
    </div>
  )
}
```

- [ ] **Step 2: 挂载到 App**

`src/App.tsx`:
```tsx
import UserPage from './pages/UserPage'

function App() {
  return <UserPage />
}

export default App
```

- [ ] **Step 3: 手动验证列表**

确保后端 `:8000` 与 `npm run dev` 均在运行，打开 `http://localhost:5173`。

Expected:
- 标题「用户管理」可见
- 表格加载用户数据（或空表）
- 分页控件显示总数；切换页码会重新请求

- [ ] **Step 4: Commit**

```bash
git add src/pages/UserPage.tsx src/App.tsx
git commit -m "$(cat <<'EOF'
feat: add user list page with pagination

EOF
)"
```

---

### Task 4: 新建 / 编辑 Modal 表单

**Files:**
- Modify: `src/pages/UserPage.tsx`

- [ ] **Step 1: 在 UserPage 中加入 Modal + Form（新建与编辑共用）**

将 `src/pages/UserPage.tsx` 替换为完整实现（含下一步删除前的编辑/新建；删除按钮仍可先占位，Task 5 再接 Popconfirm）：

```tsx
import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { createUser, deleteUser, fetchUserList, updateUser } from '../api/user'
import { ApiError } from '../api/http'
import type { User, UserFormValues } from '../types/user'

const { Title } = Typography

export default function UserPage() {
  const [list, setList] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form] = Form.useForm<UserFormValues>()

  const loadList = useCallback(async (p = page, s = pageSize) => {
    setLoading(true)
    try {
      const data = await fetchUserList(p, s)
      setList(data.list ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '加载失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    void loadList(page, pageSize)
  }, [page, pageSize, loadList])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record: User) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      age: record.age,
      height: record.height,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    form.resetFields()
  }

  const onSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      if (editing) {
        await updateUser(editing.id, values)
        message.success('更新成功')
      } else {
        await createUser(values)
        message.success('创建成功')
      }
      closeModal()
      await loadList(page, pageSize)
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) {
        return
      }
      const msg = err instanceof ApiError ? err.message : '提交失败'
      message.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (id: number) => {
    try {
      await deleteUser(id)
      message.success('删除成功')
      const nextTotal = total - 1
      const maxPage = Math.max(1, Math.ceil(nextTotal / pageSize) || 1)
      const nextPage = Math.min(page, maxPage)
      if (nextPage !== page) {
        setPage(nextPage)
      } else {
        await loadList(nextPage, pageSize)
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '删除失败'
      message.error(msg)
    }
  }

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name' },
    { title: '年龄', dataIndex: 'age', width: 80 },
    { title: '身高(cm)', dataIndex: 'height', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', width: 200 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该用户？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => onDelete(record.id)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const onTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1)
    setPageSize(pagination.pageSize ?? 10)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          用户管理
        </Title>
        <Button type="primary" onClick={openCreate}>
          新建用户
        </Button>
      </div>

      <Table<User>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
        onChange={onTableChange}
      />

      <Modal
        title={editing ? '编辑用户' : '新建用户'}
        open={modalOpen}
        onOk={() => void onSubmit()}
        onCancel={closeModal}
        confirmLoading={submitting}
        destroyOnClose
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="姓名"
            rules={[
              { required: true, message: '请输入姓名' },
              { min: 1, max: 64, message: '姓名长度为 1–64 个字符' },
            ]}
          >
            <Input placeholder="请输入姓名" maxLength={64} />
          </Form.Item>
          <Form.Item
            name="age"
            label="年龄"
            rules={[
              { required: true, message: '请输入年龄' },
              {
                type: 'number',
                min: 0,
                max: 150,
                message: '年龄范围为 0–150',
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={150} precision={0} />
          </Form.Item>
          <Form.Item
            name="height"
            label="身高(cm)"
            rules={[
              { required: true, message: '请输入身高' },
              {
                type: 'number',
                min: 50,
                max: 250,
                message: '身高范围为 50–250cm',
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={50} max={250} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
```

说明：本 Task 已一并写入删除逻辑（与 Task 5 合并实现），避免中间态重复改文件。若严格分步，可先只做 Modal，Task 5 再加 `Popconfirm`/`onDelete`。

- [ ] **Step 2: 手动验证新建与编辑**

1. 点「新建用户」→ 填合法数据 → 保存 → 提示成功且列表刷新出现新行  
2. 故意留空姓名 → 前端校验拦截  
3. 点「编辑」→ 改年龄 → 保存 → 列表更新  
4. 提交失败时（可临时停后端）→ Modal 不关闭，提示错误

- [ ] **Step 3: Commit**

```bash
git add src/pages/UserPage.tsx
git commit -m "$(cat <<'EOF'
feat: add create/edit user modal with form validation

EOF
)"
```

---

### Task 5: 删除确认与联调收尾

**Files:**
- Modify: `src/pages/UserPage.tsx`（若 Task 4 已含删除则本 Task 仅验证）
- Optional cleanup: 删除脚手架无用文件（如 `src/App.css`、`src/index.css`、`src/assets/`、默认 `README` 中与本项目无关内容）

- [ ] **Step 1: 确认删除交互已接好**

检查行操作中有：

```tsx
<Popconfirm
  title="确认删除该用户？"
  okText="删除"
  cancelText="取消"
  onConfirm={() => onDelete(record.id)}
>
  <Button type="link" danger>
    删除
  </Button>
</Popconfirm>
```

若缺失，按 Task 4 完整文件补全。

- [ ] **Step 2: 清理脚手架残留（如有）**

- 若 `main.tsx` / `App.tsx` 仍 import 了 `index.css` / `App.css` 且未使用，去掉 import 并删除无用 css  
- 删除默认 `src/assets/react.svg` 等未引用资源  
- 确保 `main.tsx` 不依赖全局样式文件（Ant Design 自带样式即可）

- [ ] **Step 3: 全流程手动联调**

后端 `:8000` + `npm run dev`：

| 场景 | Expected |
|------|----------|
| 列表分页 | 数据与 total 正确 |
| 新建 | 成功提示 + 列表有新用户 |
| 编辑 | 成功提示 + 字段更新 |
| 删除确认取消 | 不删除 |
| 删除确认确定 | 成功提示 + 行消失；末页删空时回退页码 |
| 后端 `code !== 0` | 展示后端 message |
| 后端宕机 | 提示网络/服务错误 |

- [ ] **Step 4: 构建检查**

```bash
npm run build
```

Expected: `tsc -b && vite build` 成功，无 TypeScript 错误。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: wire delete confirm and clean up scaffold leftovers

EOF
)"
```

---

## Spec Coverage Checklist

| Spec 要求 | Task |
|-----------|------|
| Vite + React TS 脚手架 | Task 1 |
| Ant Design 5 | Task 1 |
| `/api` → `:8000` proxy | Task 1 |
| `http.ts` / `user.ts` / `types/user.ts` | Task 2 |
| 列表 Table + 分页 | Task 3 |
| 新建/编辑 Modal Form | Task 4 |
| 校验 name/age/height | Task 4 |
| 删除 Popconfirm | Task 4/5 |
| message 提示 + 失败不关 Modal | Task 4 |
| 不做路由/鉴权/单测 | 全计划遵守 |

## Self-Review Notes

- 无 TBD/占位实现；API 路径与后端 `api/user/v1/user.go` 一致  
- `createdAt` 使用 camelCase，与 entity JSON 标签一致  
- 规格不做单元测试 → 各 Task 用手动验证替代 TDD 红绿循环  
