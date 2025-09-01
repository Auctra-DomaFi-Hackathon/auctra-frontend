    'use client'

import * as React from 'react'
import type { Chain } from '../../../_components/hooks/types'
import { getDomainPosition, type DomainPosition } from '../../../_components/data/mockDomains'

// Use DomainPosition type from mock data
type Position = DomainPosition

// Default fallback position
const DEFAULT_POSITION: Position = {
  id:'pos-default-001', marketId:'pool-com', marketName:'Premium .com Pool', marketTicker:'COM',
  loanToken:'USDC', chain:'Sepolia',
  domain:{ id:'alpha-com', label:'alpha.com', verified:true },
  collateralUSD:2500, debtUSD:800, ltv:70, lth:85, status:'Safe', lendAPR:3.4, borrowAPR:8.2, liquidationPrice:1200,
}

const fmtUSD = (n:number)=> n.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0})
const fmtPct = (n:number)=> `${n.toFixed(1)}%`

export function usePositionDetail(slug: string) {
  const [loading, setLoading] = React.useState(true)
  const [position, setPosition] = React.useState<Position>(() => {
    return getDomainPosition(slug) || DEFAULT_POSITION
  })
  const [activeTab, setActiveTab] = React.useState('overview')

  // action states
  const [borrowAmount, setBorrowAmount] = React.useState(0)
  const [repayAmount, setRepayAmount] = React.useState(0)
  const [supplyAmount, setSupplyAmount] = React.useState(0)

  React.useEffect(()=>{ const t=setTimeout(()=>setLoading(false),600); return ()=>clearTimeout(t) },[slug])

  const currentLTV = position.debtUSD / position.collateralUSD
  const healthFactor = position.lth/100 / currentLTV || Infinity
  const availableToBorrow = Math.max(0, position.collateralUSD * (position.ltv/100) - position.debtUSD)

  // handlers (mock)
  const handleBorrow = () => {
    if (borrowAmount <= 0 || borrowAmount > availableToBorrow) return
    const newDebt = position.debtUSD + borrowAmount
    const status: Position['status'] = newDebt / position.collateralUSD > 0.8 ? 'At Risk' : 'Safe'
    setPosition((p)=>({ ...p, debtUSD:newDebt, status }))
    setBorrowAmount(0)
  }
  const handleRepay = () => {
    if (repayAmount <= 0) return
    const newDebt = Math.max(0, position.debtUSD - repayAmount)
    const status: Position['status'] = newDebt / position.collateralUSD > 0.8 ? 'At Risk' : 'Safe'
    setPosition((p)=>({ ...p, debtUSD:newDebt, status }))
    setRepayAmount(0)
  }
  const handleSupply = () => {
    if (supplyAmount <= 0) return
    const newCol = position.collateralUSD + supplyAmount
    const status: Position['status'] = position.debtUSD / newCol > 0.8 ? 'At Risk' : 'Safe'
    setPosition((p)=>({ ...p, collateralUSD:newCol, status }))
    setSupplyAmount(0)
  }
  const handleWithdraw = () => {
    if (position.debtUSD > 0) return
    alert('Position would be withdrawn (demo)')
  }

  return {
    loading,
    position,
    activeTab, setActiveTab,
    metrics: {
      fmtUSD, fmtPct,
      currentLTV, healthFactor, availableToBorrow,
    },
    handlers: {
      borrowAmount, setBorrowAmount,
      repayAmount, setRepayAmount,
      supplyAmount, setSupplyAmount,
      handleBorrow, handleRepay, handleSupply, handleWithdraw,
    },
  }
}
