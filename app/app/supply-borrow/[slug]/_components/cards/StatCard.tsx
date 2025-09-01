'use client'
import { Card, CardContent } from '@/components/ui/card'
export default function StatCard({ title, value, icon, trend }: { title:string; value:string; icon?:React.ReactNode; trend?:string }) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">{title}</div>
          {icon}
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {trend && <div className="text-xs text-gray-500">{trend}</div>}
      </CardContent>
    </Card>
  )
}
