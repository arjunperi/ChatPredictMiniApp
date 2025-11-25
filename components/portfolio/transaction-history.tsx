'use client';

import { useState } from 'react';
import { TransactionItem } from './transaction-item';
import { SkeletonList } from '@/components/ui/skeleton';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: Date;
  marketId?: string | null;
  betId?: string | null;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function TransactionHistory({
  transactions,
  isLoading,
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<string>('all');

  if (isLoading) {
    return <SkeletonList count={5} />;
  }

  const filteredTransactions =
    filter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filter);

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
        <p className="text-slate-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Transaction History</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="BET_PLACED">Bets</option>
          <option value="SHARES_SOLD">Sales</option>
          <option value="BET_WON">Wins</option>
          <option value="BET_LOST">Losses</option>
        </select>
      </div>
      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
            <p className="text-slate-400">No transactions match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

