import { apiClient } from './api'
import type { Auction } from '@/types'

export const auctionsService = {
  getAll: async (): Promise<Auction[]> => {
    return apiClient.get<Auction[]>('/auctions')
  },

  getById: async (id: string): Promise<Auction> => {
    return apiClient.get<Auction>(`/auctions/${id}`)
  }
}