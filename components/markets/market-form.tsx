'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMarketSchema, type CreateMarketInput } from '@/lib/validation/schemas';

interface MarketFormProps {
  onSubmit: (data: { question: string; closesAt?: string | null; liquidity?: number }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MarketForm({ onSubmit, onCancel, isLoading }: MarketFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createMarketSchema),
    defaultValues: {
      question: '',
      closesAt: null,
      liquidity: 100,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Question */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Market Question *
        </label>
        <textarea
          {...register('question')}
          rows={3}
          placeholder="e.g., Will Bitcoin reach $100k by end of 2024?"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.question && (
          <p className="text-red-400 text-sm mt-1">{errors.question.message}</p>
        )}
      </div>

      {/* Closing Date */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Closing Date (Optional)
        </label>
        <input
          type="datetime-local"
          {...register('closesAt')}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.closesAt && (
          <p className="text-red-400 text-sm mt-1">{errors.closesAt.message}</p>
        )}
      </div>

      {/* Liquidity */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Liquidity Parameter (default: 100)
        </label>
        <input
          type="number"
          {...register('liquidity', { valueAsNumber: true, value: 100 })}
          min={50}
          max={1000}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-slate-500 mt-1">
          Higher liquidity = more stable prices, lower volatility
        </p>
        {errors.liquidity && (
          <p className="text-red-400 text-sm mt-1">{errors.liquidity.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Market'}
        </button>
      </div>
    </form>
  );
}

