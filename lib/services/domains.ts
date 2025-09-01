import { apiClient } from './api'
import type { Domain } from '@/types'

export const domainsService = {
  getAll: async (): Promise<Domain[]> => {
    return apiClient.get<Domain[]>('/domains')
  },

  getByName: async (name: string): Promise<Domain> => {
    return apiClient.get<Domain>(`/domains/${name}`)
  }
}