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
      
      // Handle numeric values
      if (typeof av === 'number' && typeof bv === 'number') {
        return dir === 'asc' ? av - bv : bv - av
      }
      
      // Special handling for ETH values (e.g., "1000 ETH", "2 ETH")
      if (key === 'top' && typeof av === 'string' && typeof bv === 'string' && av.includes('ETH') && bv.includes('ETH')) {
        const aNum = parseFloat(av.replace(' ETH', ''))
        const bNum = parseFloat(bv.replace(' ETH', ''))
        return dir === 'asc' ? aNum - bNum : bNum - aNum
      }
      
      // Default string comparison
      return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return copy
  }, [rows, key, dir])

  function toggle(k: keyof T) {
    if (key !== k) { setKey(k); setDir('asc') } else { setDir((d) => (d === 'asc' ? 'desc' : 'asc')) }
  }

  return { sorted, key, dir, toggle }
}
