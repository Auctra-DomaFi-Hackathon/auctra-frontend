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
      return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-700' }
    }
    return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' }
  }
  if (kind === 'Liquidations') return { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' }
  if (kind === 'Renting') {
    switch (title) {
      case 'Domain Rented': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-700' }
      case 'Rental Extended': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-700' }
      case 'Rental Ended': return { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-600' }
      case 'Security Deposit Locked': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' }
      case 'Security Deposit Claimed': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-700' }
      default: return { bg: 'bg-blue-50', border: 'border-purple-200', icon: 'text-white-700' }
    }
  }
  return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-700' }
}

export const timeShort = _timeShort
//border bg-blue-50 border-blue-200