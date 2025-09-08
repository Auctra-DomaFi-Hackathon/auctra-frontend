'use client'

import { Bell, Gavel, Coins, CheckCircle2, XCircle, ShieldAlert, Wallet, TrendingUp, TrendingDown, PlusCircle, MinusCircle, Home, Calendar, CreditCard } from 'lucide-react'
import type { EventKind } from './types'
import { timeShort as _timeShort } from './date'

export function getIcon(kind: EventKind, title: string) {
  switch (kind) {
    case 'Auctions': return Gavel
    case 'Bids': return Coins
    case 'Wins/Losses': return title.toLowerCase().includes('won') ? CheckCircle2 : XCircle
    case 'Supply & Borrow': {
      switch (title) {
        case 'Supply': return TrendingUp
        case 'Withdraw': return TrendingDown
        case 'Borrow': return MinusCircle
        case 'Repay': return PlusCircle
        case 'Collateral Deposit': return PlusCircle
        case 'Collateral Withdraw': return MinusCircle
        default: return Wallet
      }
    }
    case 'Liquidations': return ShieldAlert
    case 'Renting': {
      switch (title) {
        case 'Domain Rented': return Home
        case 'Rental Extended': return Calendar  
        case 'Rental Ended': return CheckCircle2
        case 'Security Deposit Locked': return CreditCard
        case 'Security Deposit Claimed': return TrendingUp
        default: return Home
      }
    }
    case 'Alerts': default: return Bell
  }
}

export function getTone(kind: EventKind, title: string) {
  if (kind === 'Wins/Losses') {
    if (title.toLowerCase().includes('won')) {
      return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-700 dark:text-blue-300' }
    }
    return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: 'text-red-600 dark:text-red-300' }
  }
  if (kind === 'Liquidations') return { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: 'text-amber-600 dark:text-amber-300' }
  if (kind === 'Renting') {
    switch (title) {
      case 'Domain Rented': return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-700 dark:text-blue-300' }
      case 'Rental Extended': return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-700 dark:text-blue-300' }
      case 'Rental Ended': return { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', icon: 'text-gray-600 dark:text-gray-400' }
      case 'Security Deposit Locked': return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600 dark:text-blue-300' }
      case 'Security Deposit Claimed': return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-700 dark:text-blue-300' }
      default: return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-purple-200 dark:border-purple-800', icon: 'text-blue-700 dark:text-blue-300' }
    }
  }
  return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-700 dark:text-blue-300' }
}

export const timeShort = _timeShort
//border bg-blue-50 border-blue-200