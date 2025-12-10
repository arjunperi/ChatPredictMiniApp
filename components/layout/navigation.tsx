'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getTelegramAuthHeaders } from '@/lib/telegram/utils';

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/markets', label: 'Markets', icon: '📊' },
  { href: '/portfolio', label: 'Portfolio', icon: '💼' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
];

async function getUserBalance(): Promise<number> {
  try {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && !window.Telegram?.WebApp) {
      console.warn('[Navigation] Telegram WebApp not available yet, waiting...');
      // Wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!window.Telegram?.WebApp) {
        console.error('[Navigation] Telegram WebApp still not available after wait');
        return 0;
      }
    }
    
    const headers = getTelegramAuthHeaders();
    const headersObj = headers as Record<string, string>;
    console.log('[Navigation] Fetching balance with headers:', {
      hasInitData: !!headersObj['X-Telegram-Init-Data'],
      headerKeys: Object.keys(headersObj),
    });
    
    const response = await fetch('/api/balance', {
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Navigation] Failed to fetch balance:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return 0;
    }
    const data = await response.json();
    console.log('[Navigation] Balance fetched successfully:', data.balance);
    return data.balance || 0;
  } catch (error) {
    console.error('[Navigation] Error fetching balance:', error);
    return 0;
  }
}

export function Navigation() {
  const pathname = usePathname();

  // Get user balance from API
  const { data: balance } = useQuery({
    queryKey: ['user-balance'],
    queryFn: getUserBalance,
    staleTime: 0, // Always refetch to get latest balance
    refetchOnMount: true,
  });

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <span className="font-bold text-white text-lg">ChatPredict</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Balance */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-700 rounded-lg px-4 py-2">
              <div className="text-xs text-slate-400">Balance</div>
              <div className="text-white font-bold">
                {balance?.toLocaleString() || '...'} 🪙
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-700 py-2">
          <div className="flex items-center justify-around">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="text-xs font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

