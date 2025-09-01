import { apiClient } from './api'
import type { Transfer } from '@/types'

export const transfersService = {
  getAll: async (): Promise<Transfer[]> => {
    return apiClient.get<Transfer[]>('/transfers')
  }
}