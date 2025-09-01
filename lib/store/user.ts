import { create } from 'zustand'
import type { User } from '@/types'
import { userService } from '@/lib/services'

interface UserState {
  user: User | null
  loading: boolean
  error: string | null
  fetchUser: () => Promise<void>
  addToWatchlist: (domainId: string) => void
  removeFromWatchlist: (domainId: string) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async () => {
    set({ loading: true, error: null })
    try {
      const user = await userService.getMe()
      set({ user, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addToWatchlist: (domainId: string) => {
    const { user } = get()
    if (user && !user.watchlistDomainIds.includes(domainId)) {
      set({
        user: {
          ...user,
          watchlistDomainIds: [...user.watchlistDomainIds, domainId]
        }
      })
    }
  },

  removeFromWatchlist: (domainId: string) => {
    const { user } = get()
    if (user) {
      set({
        user: {
          ...user,
          watchlistDomainIds: user.watchlistDomainIds.filter(id => id !== domainId)
        }
      })
    }
  }
}))