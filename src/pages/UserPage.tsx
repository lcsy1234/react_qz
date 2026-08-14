import { useCallback, useEffect, useState } from "react";
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
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { createUser, deleteUser, fetchUserList, updateUser } from "../api/user";
import { ApiError } from "../api/http";
import type { User, UserFormValues } from "../types/user";

const { Title } = Typography;

export default function UserPage() {
  const [list, setList] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm<UserFormValues>();

  const loadList = useCallback(
    async (p = page, s = pageSize, name = keyword) => {
      setLoading(true)
      try {
        const data = await fetchUserList({ page: p, size: s, name })
        console
        setList(data.list ?? [])
        setTotal(data.total ?? 0)
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : '加载失败'
        message.error(msg)
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize, keyword],
  )

  useEffect(() => {
    void loadList(page, pageSize, keyword)
  }, [page, pageSize, keyword, loadList])

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: User) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      age: record.age,
      height: record.height,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await updateUser(editing.id, values);
        message.success("更新成功");
      } else {
        await createUser(values);
        message.success("创建成功");
      }
      closeModal();
      await loadList(page, pageSize, keyword);
    } catch (err) {
      if (err && typeof err === "object" && "errorFields" in err) {
        return;
      }
      const msg = err instanceof ApiError ? err.message : "提交失败";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
        await loadList(nextPage, pageSize, keyword)
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
      width: 140,
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
    setPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 10);
  };

  const onSearchUser = (value: string) => {
    const next = value.trim();
    setPage(1);
    setKeyword(next);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          用户管理
        </Title>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="按姓名搜索"
            style={{ width: 240 }}
            onSearch={onSearchUser}
            enterButton
          />
          <Button type="primary" onClick={openCreate}>
            新建用户
          </Button>
        </Space>
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
        title={editing ? "编辑用户" : "新建用户"}
        open={modalOpen}
        onOk={() => void onSubmit()}
        onCancel={closeModal}
        confirmLoading={submitting}
        destroyOnHidden
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="姓名"
            rules={[
              { required: true, message: "请输入姓名" },
              { min: 1, max: 64, message: "姓名长度为 1–64 个字符" },
            ]}
          >
            <Input placeholder="请输入姓名" maxLength={64} />
          </Form.Item>
          <Form.Item
            name="age"
            label="年龄"
            rules={[
              { required: true, message: "请输入年龄" },
              {
                type: "number",
                min: 0,
                max: 150,
                message: "年龄范围为 0–150",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              max={150}
              precision={0}
            />
          </Form.Item>
          <Form.Item
            name="height"
            label="身高(cm)"
            rules={[
              { required: true, message: "请输入身高" },
              {
                type: "number",
                min: 50,
                max: 250,
                message: "身高范围为 50–250cm",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={50} max={250} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
