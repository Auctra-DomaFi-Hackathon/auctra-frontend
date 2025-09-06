"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import Image from "next/image";

export default function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  hint,
  step,
  min,
  placeholder,
  showEthlogo = false,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  step?: string;
  min?: string;
  placeholder?: string;
  showEthlogo?: boolean;
}) {
  return (
    <div>
      <Label
        htmlFor={id}
        className={
          showEthlogo
            ? "mb-3 flex items-center gap-2 text-black dark:text-white"
            : "text-black dark:text-white"
        }
      >
        {label}
        {showEthlogo && (
          <Image
            src="/images/LogoCoin/eth-logo.svg"
            alt="Ethereum"
            className="h-4 w-4"
            width={50}
            height={20}
          />
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
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
          <Info className="h-3.5 w-3.5" /> {hint}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 mt-1">
          {error}
        </div>
      )}
    </div>
  );
}
