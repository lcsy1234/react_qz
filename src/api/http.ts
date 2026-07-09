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
