import { apiClient } from './api'
import type { Bid } from '@/types'

export const bidsService = {
  getAll: async (): Promise<Bid[]> => {
    return apiClient.get<Bid[]>('/bids')
  },

  getByAuctionId: async (auctionId: string): Promise<Bid[]> => {
    return apiClient.get<Bid[]>(`/bids?auctionId=${auctionId}`)
  }
}