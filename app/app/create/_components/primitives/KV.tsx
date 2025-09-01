'use client'

export default function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-600">{k}</span>
      <span className="font-medium text-gray-900">{v}</span>
    </div>
  )
}
