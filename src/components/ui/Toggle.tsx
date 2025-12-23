import React from 'react'

export interface ToggleProps {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-full p-4 rounded-xl border-2 flex items-center justify-between gap-4 transition-all ${
        checked ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}`}
    >
      <span className="text-lg font-medium text-gray-700">{label}</span>
      <span
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  )
}
