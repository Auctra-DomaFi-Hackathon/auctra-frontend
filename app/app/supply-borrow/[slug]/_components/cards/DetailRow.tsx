'use client'
export default function DetailRow({ label, value }: { label:string; value:string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  )
}
