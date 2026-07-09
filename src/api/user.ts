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
