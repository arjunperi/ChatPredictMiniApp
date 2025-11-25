import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: Date;
  marketId?: string | null;
  betId?: string | null;
}

interface TransactionItemProps {
  transaction: Transaction;
}

const transactionIcons: Record<string, string> = {
  INITIAL_GRANT: '🎁',
  BET_PLACED: '📊',
  SHARES_SOLD: '💰',
  BET_WON: '✅',
  BET_LOST: '❌',
  MARKET_RESOLVED: '🏁',
};

const transactionColors: Record<string, string> = {
  INITIAL_GRANT: 'text-green-400',
  BET_PLACED: 'text-blue-400',
  SHARES_SOLD: 'text-yellow-400',
  BET_WON: 'text-green-400',
  BET_LOST: 'text-red-400',
  MARKET_RESOLVED: 'text-purple-400',
};

export function TransactionItem({ transaction }: TransactionItemProps) {
  const icon = transactionIcons[transaction.type] || '📝';
  const color = transactionColors[transaction.type] || 'text-slate-400';
  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="text-white font-medium">{transaction.description}</div>
          <div className="text-xs text-slate-400 mt-1">
            {formatDistanceToNow(new Date(transaction.createdAt), {
              addSuffix: true,
            })}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div
          className={`font-bold ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isPositive ? '+' : ''}
          {transaction.amount.toLocaleString()} 🪙
        </div>
        {transaction.marketId && (
          <Link
            href={`/markets/${transaction.marketId}`}
            className="text-xs text-blue-400 hover:text-blue-300 mt-1 block"
          >
            View Market →
          </Link>
        )}
      </div>
    </div>
  );
}

