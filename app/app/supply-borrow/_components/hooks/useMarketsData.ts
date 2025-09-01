'use client'

import * as React from 'react'
import type { Market, DomainItem, Position } from './types'
import { MOCK_DOMAINS, MOCK_MARKETS } from './mooks'

export function useMarketsData() {
  const [query, setQuery] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  // sheet state
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Market | null>(null)

  // positions
  const [positions, setPositions] = React.useState<Position[]>([])

  // supply form state (inside drawer)
  const [supplyState, setSupplyState] = React.useState<{
    selectedDomainId?: string
    supplyMarketId?: string
    supplyValue: number
  }>({ supplyValue: 0 })

  React.useEffect(() => {
    // Remove artificial delay - load UI immediately
    setLoading(false)
  }, [])

  const filtered = React.useMemo(
    () =>
      MOCK_MARKETS.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.ticker.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  )

  function openMarket(m: Market) {
    setSelected(m)
    setOpen(true)
    setSupplyState((s) => ({ ...s, supplyMarketId: m.id }))
  }

  function handleSupply() {
    if (!selected || !supplyState.selectedDomainId || (supplyState.supplyValue || 0) <= 0) return
    const domain = MOCK_DOMAINS.find((d) => d.id === supplyState.selectedDomainId)!
    const pos: Position = {
      id: `${selected.id}-${Date.now()}`,
      marketId: selected.id,
      domain,
      collateralUSD: supplyState.supplyValue,
      debtUSD: 0,
      ltv: 70,
      lth: 85,
      status: 'Safe',
    }
    setPositions((prev) => [pos, ...prev])
    setSupplyState({ supplyMarketId: selected.id, supplyValue: 0 })
  }

  return {
    // state
    query, setQuery, loading, filtered,
    open, setOpen, selected, setSelected, openMarket,
    positions, setPositions,
    supplyState, setSupplyState, handleSupply,
    // expose mocks & types for child components if needed
    MOCK_DOMAINS, MOCK_MARKETS,
  }
}
