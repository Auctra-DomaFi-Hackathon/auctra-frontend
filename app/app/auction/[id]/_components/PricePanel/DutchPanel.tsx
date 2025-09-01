'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DutchPanel({
  currentPrice,
  onBuyNow,
}: {
  currentPrice: number
  onBuyNow: () => Promise<void> | void
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">Dutch Auction - Price Decreasing</h2>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
            <div className="text-3xl font-bold text-blue-900 mb-2">
              ${currentPrice.toLocaleString()}
            </div>
            <p className="text-blue-700">Current Price</p>
          </div>
          <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700" onClick={onBuyNow}>
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
