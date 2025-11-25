'use client';

import { useQuery } from '@tanstack/react-query';
import { UserResponse } from '@/types/api';

// TODO: Replace with actual telegramId from user context
function getPortfolioData(): Promise<UserResponse['user']> {
  // This is a placeholder - will be replaced with actual API call
  return fetch('/api/users/123456789') // Placeholder telegramId
    .then((res) => res.json())
    .then((data: UserResponse) => data.user);
}

export function usePortfolio(telegramId?: string) {
  return useQuery({
    queryKey: ['portfolio', telegramId],
    queryFn: getPortfolioData,
    enabled: !!telegramId,
  });
}

