'use client'

import { Bell, Gavel, Coins, CheckCircle2, XCircle, ShieldAlert, Wallet } from 'lucide-react'
import type { EventKind } from './types'
import { timeShort as _timeShort } from './date'

export function getIcon(kind: EventKind, title: string) {
  switch (kind) {
    case 'Auctions': return Gavel
    case 'Bids': return Coins
    case 'Wins/Losses': return title.toLowerCase().includes('won') ? CheckCircle2 : XCircle
    case 'Supply & Borrow': return Wallet
    case 'Liquidations': return ShieldAlert
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
  return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-700' }
}

export const timeShort = _timeShort
