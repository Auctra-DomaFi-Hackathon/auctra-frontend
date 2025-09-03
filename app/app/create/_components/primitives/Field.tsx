'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Info } from 'lucide-react'
import Image from 'next/image'

export default function Field({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  step,
  min,
  placeholder,
  showDomaLogo = false,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  hint?: string
  step?: string
  min?: string
  placeholder?: string
  showDomaLogo?: boolean
}) {
  return (
    <div>
      <Label htmlFor={id} className={showDomaLogo ? "flex items-center gap-2" : ""}>
        {label}
        {showDomaLogo && (
          <Image src="/images/logo/domaLogo.svg" alt="Doma" className="h-4 w-4" width={50} height={20}/>
        )}
      </Label>
      <Input 
        id={id} 
        type={type} 
        value={value} 
        onChange={onChange}
        step={step}
        min={min}
        placeholder={placeholder}
      />
      {hint && (
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Info className="h-3.5 w-3.5" /> {hint}
        </div>
      )}
      {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
    </div>
  )
}
