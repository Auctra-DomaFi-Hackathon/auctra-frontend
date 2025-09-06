'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Timer, Globe, Gavel } from 'lucide-react'
import {ChartLineUp} from "@phosphor-icons/react";
import { cn } from '@/lib/utils'
import { fmtDelta } from '../hooks/useSearch'

export default function KpiGrid({
  items,
  className,
}: {
  items: readonly { label: string; value: string; delta: number; icon: any }[]
  className?: string
}) {
  return (
    <section className={cn('grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6', className)}>
      {items.map(({ label, value, delta, icon }) => (
        <Card key={label} className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <CardContent className="p-5">
            <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
            <div className="mt-1 flex items-center justify-between">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
              <div className="h-5 w-5 flex items-center justify-center">
                {(() => {
                  // Handle specific icons by label
                  if (label === 'My Bids') {
                    return <Gavel className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
                  }
                  if (label === 'Active Auctions') {
                    return <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
                  }
                  if (label === 'Domains') {
                    return <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
                  }
                  
                  // Handle function icons
                  if (typeof icon === 'function') {
                    return React.createElement(icon, { className: 'h-5 w-5 text-blue-600 dark:text-blue-400' });
                  }
                  
                  // Handle image icons
                  if (icon && (typeof icon === 'string' || icon?.src)) {
                    return (
                      <Image
                        src={typeof icon === 'string' ? icon : icon.src}
                        alt="icon"
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                    );
                  }
                  
                  return null;
                })()}
              </div>
            </div>
            <div
              className={cn(
                'mt-2 inline-flex items-center text-sm rounded-lg px-2 py-0.5',
                delta >= 0 
                  ? 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30' 
                  : 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30'
              )}
            >
              <ChartLineUp className="h-3.5 w-3.5 mr-1" />
              {fmtDelta(delta)} vs last month
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
