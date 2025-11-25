'use client';

import { useState } from 'react';

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
  placeholder?: string;
}

export function AmountInput({
  value,
  onChange,
  max,
  label = 'Amount',
  placeholder = 'Enter amount',
}: AmountInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= 0) {
      const clampedValue = max ? Math.min(numValue, max) : numValue;
      onChange(clampedValue);
    } else if (newValue === '') {
      onChange(0);
    }
  };

  const quickAmounts = [10, 50, 100, 500];

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          min={0}
          max={max}
          step={0.01}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          🪙
        </span>
      </div>
      {max && (
        <p className="text-xs text-slate-500 mt-1">
          Max: {max.toLocaleString()} tokens
        </p>
      )}
      <div className="flex gap-2 mt-2">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => {
              const finalAmount = max ? Math.min(amount, max) : amount;
              setInputValue(finalAmount.toString());
              onChange(finalAmount);
            }}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
          >
            {amount}
          </button>
        ))}
        {max && (
          <button
            type="button"
            onClick={() => {
              setInputValue(max.toString());
              onChange(max);
            }}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
          >
            Max
          </button>
        )}
      </div>
    </div>
  );
}

