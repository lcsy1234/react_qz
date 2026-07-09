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
