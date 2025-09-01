export interface Notification {
  id: string
  type: 'outbid' | 'revealWindow' | 'settled' | 'transferUpdate'
  payload: Record<string, any>
  createdAt: string
  read: boolean
  deepLink: string
}