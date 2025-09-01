'use client'
import { Input } from '@/components/ui/input'
export default function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string)=>void; placeholder?: string }) {
  return (
    <div className="w-full sm:w-72">
      <Input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="bg-white" />
    </div>
  )
}
