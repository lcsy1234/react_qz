import { request } from './http'
import type {
  CreateUserWithTaskFormValues,
  CreateUserWithTaskResult,
  TaskDetailResult,
} from '../types/transaction'

export function createUserWithTask(data: CreateUserWithTaskFormValues) {
  return request<CreateUserWithTaskResult>('/user/with-task', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function fetchTaskDetail(userId: number) {
  const qs = new URLSearchParams({ userId: String(userId) })
  return request<TaskDetailResult>(`/task/detail?${qs.toString()}`)
}
