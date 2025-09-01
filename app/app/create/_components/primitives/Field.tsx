'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Info } from 'lucide-react'

export default function Field({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  hint?: string
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={onChange} />
      {hint && (
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Info className="h-3.5 w-3.5" /> {hint}
        </div>
      )}
      {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
    </div>
  )
}
