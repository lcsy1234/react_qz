import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Typography,
  message,
} from 'antd'
import { createUserWithTask, fetchTaskDetail } from '../api/transaction'
import { ApiError } from '../api/http'
import type { CreateUserWithTaskFormValues, TaskDetailResult } from '../types/transaction'

const { Title, Paragraph, Text } = Typography

export default function TransactionDemoPage() {
  const [submitting, setSubmitting] = useState(false)
  const [detail, setDetail] = useState<TaskDetailResult | null>(null)
  const [form] = Form.useForm<CreateUserWithTaskFormValues>()

  const onSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      setDetail(null)

      const payload: CreateUserWithTaskFormValues = {
        ...values,
        taskDeadline: values.taskDeadline,
      }

      const result = await createUserWithTask(payload)
      message.success(`创建成功：用户 #${result.userId}，任务 #${result.taskId}`)

      const taskDetail = await fetchTaskDetail(result.userId)
      setDetail(taskDetail)
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) {
        return
      }
      const msg = err instanceof ApiError ? err.message : '提交失败'
      message.error(msg)
      setDetail(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Title level={3}>事务场景：创建用户 + 初始任务</Title>
      <Paragraph type="secondary">
        前端一次提交，后端用事务保证「用户」和「任务」要么同时成功，要么同时失败。
        打开「模拟失败」后，用户插入成功但任务前会故意报错，列表里不应出现半成品用户。
      </Paragraph>

      <Card title="提交表单" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            taskUrgency: 'medium',
            taskDeadline: '2026-07-20 18:00:00',
            forceFail: false,
          }}
        >
          <Title level={5}>用户信息</Title>
          <Form.Item
            name="name"
            label="姓名"
            rules={[
              { required: true, message: '请输入姓名' },
              { min: 1, max: 64, message: '姓名长度为 1–64 个字符' },
            ]}
          >
            <Input placeholder="建议使用未出现过的姓名便于验证回滚" maxLength={64} />
          </Form.Item>
          <Form.Item
            name="age"
            label="年龄"
            rules={[
              { required: true, message: '请输入年龄' },
              { type: 'number', min: 0, max: 150, message: '年龄范围为 0–150' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={150} precision={0} />
          </Form.Item>
          <Form.Item
            name="height"
            label="身高(cm)"
            rules={[
              { required: true, message: '请输入身高' },
              { type: 'number', min: 50, max: 250, message: '身高范围为 50–250cm' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={50} max={250} />
          </Form.Item>

          <Title level={5} style={{ marginTop: 8 }}>
            初始任务
          </Title>
          <Form.Item
            name="taskTitle"
            label="任务标题"
            rules={[
              { required: true, message: '请输入任务标题' },
              { min: 1, max: 128, message: '任务标题长度为 1–128 个字符' },
            ]}
          >
            <Input placeholder="例如：完成入职培训" maxLength={128} />
          </Form.Item>
          <Form.Item
            name="taskUrgency"
            label="紧急程度"
            rules={[{ required: true, message: '请选择紧急程度' }]}
          >
            <Select
              options={[
                { value: 'low', label: '低' },
                { value: 'medium', label: '中' },
                { value: 'high', label: '高' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="taskDeadline"
            label="截止时间"
            rules={[
              { required: true, message: '请输入截止时间' },
              {
                pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
                message: '格式为 YYYY-MM-DD HH:mm:ss',
              },
            ]}
          >
            <Input placeholder="2026-07-20 18:00:00" />
          </Form.Item>

          <Form.Item
            name="forceFail"
            label="模拟失败（演示回滚）"
            valuePropName="checked"
            extra="开启后后端会在插入用户后故意失败，用于观察事务回滚效果"
          >
            <Switch />
          </Form.Item>

          <Button type="primary" loading={submitting} onClick={() => void onSubmit()}>
            提交（事务接口）
          </Button>
        </Form>
      </Card>

      {detail && (
        <Card title="创建结果（任务详情）">
          <Paragraph>
            用户：<Text strong>{detail.name}</Text>（ID: {detail.id}）
          </Paragraph>
          <Paragraph>
            任务数：{detail.taskList?.length ?? 0}
          </Paragraph>
          {detail.taskList?.map((task) => (
            <Alert
              key={task.id}
              style={{ marginBottom: 8 }}
              type="info"
              message={`#${task.id} ${task.title}`}
              description={`紧急程度: ${task.urgency}，截止: ${task.deadline}，状态: ${task.status === 1 ? '已完成' : '未完成'}`}
            />
          ))}
        </Card>
      )}
    </div>
  )
}
