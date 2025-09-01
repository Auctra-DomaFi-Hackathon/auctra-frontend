'use client'

import * as React from 'react'
import { groupBy, dayKey } from '../utils/date'
import { MOCK } from '../utils/mock'
import type { ActivityItem, EventKind } from '../utils/types'

export function useHistoryData() {
  const [search, setSearch] = React.useState('')
  const [active, setActive] = React.useState<EventKind | 'All'>('All')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600) // simulate fetch
    return () => clearTimeout(t)
  }, [])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return MOCK.filter((e) => {
      const okFilter = active === 'All' ? true : e.kind === active
      const okSearch =
        q.length === 0 ||
        [e.title, e.subtitle, e.domain, e.amount]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      return okFilter && okSearch
    }).sort((a, b) => +new Date(b.time) - +new Date(a.time))
  }, [search, active])

  const grouped = React.useMemo(() => groupBy(filtered, (i: ActivityItem) => dayKey(i.time)), [filtered])

  return { search, setSearch, active, setActive, loading, grouped, flat: filtered }
}
