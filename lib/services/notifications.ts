import { apiClient } from './api'
import type { Notification } from '@/types'

export const notificationsService = {
  getAll: async (): Promise<Notification[]> => {
    return apiClient.get<Notification[]>('/notifications')
  }
}