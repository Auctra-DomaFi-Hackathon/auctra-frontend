import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

// Transaction state interface
export interface TransactionState {
  isLoading: boolean
  isSuccess: boolean
  error: string | null
  hash: `0x${string}` | undefined
}

// Global transaction states (per listing/transaction ID)
export const transactionStatesAtom = atom<Record<string, TransactionState>>({})

// End Auction specific atoms
export const endAuctionStatesAtom = atom<Record<string, TransactionState>>({})

export const endAuctionLoadingAtom = atomFamily((listingId: string) =>
  atom(
    (get) => get(endAuctionStatesAtom)[listingId]?.isLoading ?? false,
    (get, set, loading: boolean) => {
      const current = get(endAuctionStatesAtom)
      set(endAuctionStatesAtom, {
        ...current,
        [listingId]: { 
          ...current[listingId], 
          isLoading: loading,
          isSuccess: false,
          error: null,
          hash: undefined
        }
      })
    }
  )
)

// Success state atoms
export const endAuctionSuccessAtom = atom<{
  open: boolean
  hash?: `0x${string}`
  domain?: string
}>({ open: false })

// Action atoms for end auction success
export const openEndAuctionSuccessAtom = atom(
  null,
  (get, set, { hash, domain }: { hash: `0x${string}`, domain: string }) => {
    set(endAuctionSuccessAtom, { open: true, hash, domain })
  }
)

export const closeEndAuctionSuccessAtom = atom(
  null,
  (get, set) => {
    set(endAuctionSuccessAtom, { open: false })
  }
)