export interface CreateUserWithTaskFormValues {
  name: string
  age: number
  height: number
  taskTitle: string
  taskUrgency: 'low' | 'medium' | 'high'
  taskDeadline: string
  forceFail: boolean
}

export interface CreateUserWithTaskResult {
  userId: number
  taskId: number
}

export interface TaskItem {
  id: number
  userId: number
  title: string
  urgency: string
  deadline: string
  status: number
}

export interface TaskDetailResult {
  id: number
  name: string
  age: number
  height: number
  taskList: TaskItem[]
}
