'use client';

import { useState } from 'react';
import { useAddTokens } from '@/hooks/use-add-tokens';
import { useClearPositions } from '@/hooks/use-clear-positions';

export function AddTokensButton() {
  const [amount, setAmount] = useState(1000);
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const addTokensMutation = useAddTokens();
  const clearPositionsMutation = useClearPositions();

  const handleAdd = async () => {
    if (amount <= 0) return;
    
    try {
      await addTokensMutation.mutateAsync({ amount });
      setIsOpen(false);
      setAmount(1000); // Reset to default
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleClearPositions = async () => {
    try {
      await clearPositionsMutation.mutateAsync();
      setShowClearConfirm(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (!isOpen && !showClearConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>Add Test Tokens</span>
        </button>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>🗑️</span>
          <span>Clear Positions</span>
        </button>
      </div>
    );
  }

  if (showClearConfirm) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-2">Clear All Positions?</h3>
        <p className="text-sm text-slate-400 mb-4">
          This will delete all your bets/positions. This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleClearPositions}
            disabled={clearPositionsMutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {clearPositionsMutation.isPending ? 'Clearing...' : 'Yes, Clear All'}
          </button>
          <button
            onClick={() => setShowClearConfirm(false)}
            disabled={clearPositionsMutation.isPending}
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">Add Test Tokens</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
          min="1"
          max="10000"
          className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter amount"
        />
        <p className="text-xs text-slate-400 mt-1">
          Maximum: 10,000 tokens (for testing)
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={amount <= 0 || addTokensMutation.isPending}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {addTokensMutation.isPending ? 'Adding...' : `Add ${amount.toLocaleString()} Tokens`}
        </button>
        <button
          onClick={() => {
            setIsOpen(false);
            setAmount(1000);
          }}
          disabled={addTokensMutation.isPending}
          className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

