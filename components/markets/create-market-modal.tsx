'use client';

import { useState } from 'react';
import { MarketForm } from './market-form';
import { CreateMarketInput } from '@/lib/validation/schemas';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { useTelegramContext } from '@/lib/telegram/context';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMarketModal({ isOpen, onClose }: CreateMarketModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { chatId, userId } = useTelegramContext();

  if (!isOpen) return null;

  const handleSubmit = async (data: CreateMarketInput) => {
    setIsLoading(true);
    try {
      // Use chatId from context, or fallback to user-specific chatId
      const finalChatId = chatId || (userId ? `user-${userId}` : null);
      
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: data.question,
          closesAt: data.closesAt || null,
          liquidity: data.liquidity || 100,
          chatId: finalChatId, // Include chatId for group scoping
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create market');
      }

      const result = await response.json();
      success('Market created successfully!');
      router.push(`/markets/${result.market.id}`);
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to create market');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create New Market</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          <MarketForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

