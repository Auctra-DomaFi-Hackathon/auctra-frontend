import { ReactNode } from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  children?: ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="space-y-2 mb-4">
      <div>
        <label className="text-sm font-medium text-gray-900">
          {label}
        </label>
        {hint && (
          <p className="text-xs text-gray-500 mt-1">
            {hint}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}