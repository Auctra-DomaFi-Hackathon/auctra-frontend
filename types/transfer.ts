export interface Transfer {
  id: string
  domainId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  registrarTicket?: string | null
  txHash?: string | null
  updatedAt: string
}