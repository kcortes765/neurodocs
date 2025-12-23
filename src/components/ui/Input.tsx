import React, { useState } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  variant?: 'text' | 'rut';
  onChange?: (value: string) => void;
}

const formatRut = (value: string): string => {
  // Remove all non-numeric characters except 'k' or 'K'
  const cleaned = value.replace(/[^0-9kK]/g, '');

  if (cleaned.length === 0) return '';

  // Separate body and verifier
  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1).toUpperCase();

  if (body.length === 0) return verifier;

  // Format body with dots
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formattedBody}-${verifier}`;
};

const cleanRut = (value: string): string => {
  return value.replace(/[^0-9kK]/g, '');
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  variant = 'text',
  onChange,
  className = '',
  value: controlledValue,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue !== undefined ? String(controlledValue) : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (variant === 'rut') {
      const formatted = formatRut(newValue);
      const cleaned = cleanRut(newValue);

      if (controlledValue === undefined) {
        setInternalValue(formatted);
      }

      if (onChange) {
        onChange(cleaned);
      }
    } else {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      if (onChange) {
        onChange(newValue);
      }
    }
  };

  return (
    <div className="w-full">
      <label className="block text-lg font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        {...props}
        value={variant === 'rut' ? (controlledValue !== undefined ? formatRut(String(controlledValue)) : internalValue) : value}
        onChange={handleChange}
        className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
      />
      {error && (
        <p className="mt-2 text-base text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};
