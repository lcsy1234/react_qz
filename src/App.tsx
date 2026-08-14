import { useState } from 'react'
import { Layout, Menu } from 'antd'
import {
  ApartmentOutlined,
  SwapOutlined,
  UserOutlined,
} from '@ant-design/icons'
import UserPage from './pages/UserPage'
import TransactionDemoPage from './pages/TransactionDemoPage'
import FlowDemoPage from './pages/FlowDemoPage'

const { Sider, Content } = Layout

type Page = 'user' | 'transaction' | 'flow'

const menuItems = [
  { key: 'user', icon: <UserOutlined />, label: '用户管理' },
  { key: 'transaction', icon: <SwapOutlined />, label: '事务演示' },
  { key: 'flow', icon: <ApartmentOutlined />, label: 'React Flow Demo' },
]

function App() {
  const [page, setPage] = useState<Page>('user')

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={200}>
        <div
          style={{
            height: 48,
            margin: 16,
            fontWeight: 600,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          react_qz
        </div>
        <Menu
          mode="inline"
          selectedKeys={[page]}
          items={menuItems}
          onClick={({ key }) => setPage(key as Page)}
        />
      </Sider>
      <Layout>
        <Content
          style={{
            margin: 0,
            minHeight: 280,
            background: '#fff',
            overflow: 'auto',
            height: '100vh',
          }}
        >
          {page === 'user' && <UserPage />}
          {page === 'transaction' && <TransactionDemoPage />}
          {page === 'flow' && <FlowDemoPage />}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
