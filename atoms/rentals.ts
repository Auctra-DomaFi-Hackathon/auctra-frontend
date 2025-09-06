import { atom } from 'jotai'
import type { ListingWithMeta } from '@/lib/rental/types'

// Rent dialog state
export const rentDialogAtom = atom<{
  open: boolean
  listing: ListingWithMeta | null
}>({ open: false, listing: null })

// Action atoms for rent dialog
export const openRentDialogAtom = atom(
  null,
  (get, set, listing: ListingWithMeta) => {
    set(rentDialogAtom, { open: true, listing })
  }
)

export const closeRentDialogAtom = atom(
  null,
  (get, set) => {
    set(rentDialogAtom, { open: false, listing: null })
  }
)