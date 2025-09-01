import { create } from 'zustand'
import type { Notification } from '@/types'
import { notificationsService } from '@/lib/services'

interface AlertsState {
  notifications: Notification[]
  loading: boolean
  error: string | null
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Notification) => void
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      const notifications = await notificationsService.getAll()
      set({ notifications, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  markAsRead: (notificationId: string) => {
    const { notifications } = get()
    set({
      notifications: notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    })
  },

  markAllAsRead: () => {
    const { notifications } = get()
    set({
      notifications: notifications.map(n => ({ ...n, read: true }))
    })
  },

  addNotification: (notification: Notification) => {
    const { notifications } = get()
    set({
      notifications: [notification, ...notifications]
    })
  }
}))