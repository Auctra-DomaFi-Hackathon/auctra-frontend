'use client'

import * as React from 'react'
export type SortDir = 'asc' | 'desc'

export function useSort<T>(rows: T[], initialKey: keyof T | null = null, initialDir: SortDir = 'asc') {
  const [key, setKey] = React.useState<keyof T | null>(initialKey)
  const [dir, setDir] = React.useState<SortDir>(initialDir)

  const sorted = React.useMemo(() => {
    if (!key) return rows
    const copy = [...rows]
    copy.sort((a: any, b: any) => {
      const av = a[key as string]
      const bv = b[key as string]
      if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av
      return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return copy
  }, [rows, key, dir])

  function toggle(k: keyof T) {
    if (key !== k) { setKey(k); setDir('asc') } else { setDir((d) => (d === 'asc' ? 'desc' : 'asc')) }
  }

  return { sorted, key, dir, toggle }
}
