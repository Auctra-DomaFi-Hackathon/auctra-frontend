import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

// Global loading state
export const globalLoadingAtom = atom(false)

// Page-specific loading atoms
export const pageLoadingAtom = atomFamily((page: string) => atom(false))

// Component-specific loading atoms  
export const componentLoadingAtom = atomFamily((component: string) => atom(false))

// Specific loading atoms for common operations
export const auctionCreationLoadingAtom = atom(false)
export const bidSubmissionLoadingAtom = atom(false)
export const domainFetchLoadingAtom = atom(false)
export const transactionLoadingAtom = atom(false)