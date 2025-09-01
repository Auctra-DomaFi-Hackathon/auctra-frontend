'use client'
export function StatCard({ title, value, icon }: { title:string; value:string; icon?:React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 flex items-center gap-2 text-xl font-semibold text-gray-900">{icon} {value}</div>
    </div>
  )
}
