export interface User {
  address: string
  username: string
  email?: string | null
  watchlistDomainIds: string[]
  notifChannels: {
    wallet: boolean
    email: boolean
    telegram: boolean
  }
}