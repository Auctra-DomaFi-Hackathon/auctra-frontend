'use client'
export default function LoadingList() {
  return (
    <div className="space-y-3">
      {[1,2,3,4,5].map((i)=>(
        <div key={i} className="h-20 w-full rounded-2xl bg-blue-100/40 animate-pulse" />
      ))}
    </div>
  )
}
