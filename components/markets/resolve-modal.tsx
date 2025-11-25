'use client';

import { useState } from 'react';
import { Market } from '@/types/market';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

interface ResolveModalProps {
  market: Market;
  isOpen: boolean;
  onClose: () => void;
}

export function ResolveModal({
  market,
  isOpen,
  onClose,
}: ResolveModalProps) {
  const [resolution, setResolution] = useState<'YES' | 'NO' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: showError } = useToast();
  const router = useRouter();

  if (!isOpen) return null;

  const handleResolve = async () => {
    if (!resolution) return;

    setIsLoading(true);
    try {
      // TODO: Get actual telegramId from user context
      const resolverTelegramId = '123456789'; // Placeholder

      const response = await fetch(`/api/markets/${market.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution,
          resolverTelegramId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resolve market');
      }

      const result = await response.json();
      success('Market resolved successfully!');
      router.refresh();
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to resolve market');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Resolve Market</h2>
          <p className="text-slate-400 mb-6">{market.question}</p>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => setResolution('YES')}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                resolution === 'YES'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              YES
            </button>
            <button
              onClick={() => setResolution('NO')}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                resolution === 'NO'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              NO
            </button>
          </div>

          {resolution && (
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-300 mb-2">
                This will resolve the market as <strong>{resolution}</strong> and
                distribute payouts to winners.
              </p>
              <p className="text-xs text-slate-400">
                This action cannot be undone.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              disabled={!resolution || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Resolving...' : 'Resolve Market'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

