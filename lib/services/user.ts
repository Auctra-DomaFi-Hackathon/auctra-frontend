import { apiClient } from './api'
import type { User } from '@/types'

export const userService = {
  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/users/me')
  }
}