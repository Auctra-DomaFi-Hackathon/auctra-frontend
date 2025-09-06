import { atom } from 'jotai'

// Success Dialog State (consolidating all success dialogs)
export interface SuccessDialogState {
  open: boolean
  type: 'bid' | 'endAuction' | 'purchase' | 'rent'
  transactionHash?: `0x${string}`
  domain?: string
  message?: string
}

export const successDialogAtom = atom<SuccessDialogState>({
  open: false,
  type: 'bid'
})

// Action atoms for success dialog
export const openSuccessDialogAtom = atom(
  null,
  (get, set, data: Omit<SuccessDialogState, 'open'>) => {
    set(successDialogAtom, { ...data, open: true })
  }
)

export const closeSuccessDialogAtom = atom(
  null,
  (get, set) => {
    set(successDialogAtom, prev => ({ ...prev, open: false }))
  }
)