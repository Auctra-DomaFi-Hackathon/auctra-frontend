import { create } from 'zustand'

interface PendingBid {
  auctionId: string
  amount: number
  salt?: string
  commitHash?: string
  type: 'dutch' | 'sealed'
  timestamp: number
}

interface BidsState {
  pendingBids: PendingBid[]
  addPendingBid: (bid: Omit<PendingBid, 'timestamp'>) => void
  removePendingBid: (auctionId: string) => void
  getPendingBid: (auctionId: string) => PendingBid | undefined
  clearPendingBids: () => void
}

export const useBidsStore = create<BidsState>((set, get) => ({
  pendingBids: [],

  addPendingBid: (bid) => {
    const { pendingBids } = get()
    const existing = pendingBids.find(b => b.auctionId === bid.auctionId)
    
    if (existing) {
      set({
        pendingBids: pendingBids.map(b =>
          b.auctionId === bid.auctionId
            ? { ...bid, timestamp: Date.now() }
            : b
        )
      })
    } else {
      set({
        pendingBids: [...pendingBids, { ...bid, timestamp: Date.now() }]
      })
    }
  },

  removePendingBid: (auctionId: string) => {
    const { pendingBids } = get()
    set({
      pendingBids: pendingBids.filter(b => b.auctionId !== auctionId)
    })
  },

  getPendingBid: (auctionId: string) => {
    const { pendingBids } = get()
    return pendingBids.find(b => b.auctionId === auctionId)
  },

  clearPendingBids: () => {
    set({ pendingBids: [] })
  }
}))