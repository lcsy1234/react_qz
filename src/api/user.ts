import { request } from './http'
import type { CreateUserResult, UserFormValues, UserListResult } from '../types/user'

export interface FetchUserListParams {
  page: number
  size: number
  name?: string
}

export function fetchUserList({ page, size, name }: FetchUserListParams) {
  const qs = new URLSearchParams({
    page: String(page),
    size: String(size),
  })
  const keyword = name?.trim()
  if (keyword) {
    qs.set('name', keyword)
  }
  // GET 列表：参数走 query，不要放 body（浏览器/代理常忽略 GET body）
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
