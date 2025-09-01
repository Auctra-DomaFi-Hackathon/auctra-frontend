'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Empty() {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <Bell className="mx-auto h-8 w-8 text-blue-600" />
      <div className="mt-2 font-medium text-gray-900">No history yet</div>
      <div className="text-sm text-gray-600">Your activity & alerts will show up here as you use Auctra.</div>
      <div className="mt-4">
        <Button variant="outline">Explore Auctions</Button>
      </div>
    </div>
  )
}
