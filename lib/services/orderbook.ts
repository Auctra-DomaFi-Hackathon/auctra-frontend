import { apiClient } from './api'
import type { ActivityItem } from '@/types'

export const orderbookService = {
  getRecentSales: async (): Promise<{ recentSales: ActivityItem[] }> => {
    return apiClient.get<{ recentSales: ActivityItem[] }>('/orderbook')
  }
}