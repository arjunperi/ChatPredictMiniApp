import { z } from 'zod';

export const createMarketSchema = z.object({
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters')
    .max(200, 'Question must be less than 200 characters'),
  closesAt: z.string().nullable().optional(),
  liquidity: z.number().min(50).max(1000).optional(),
});

export const placeBetSchema = z.object({
  marketId: z.string().min(1, 'Market ID is required'),
  outcome: z.enum(['YES', 'NO'], { message: 'Outcome must be YES or NO' }),
  amount: z.number().min(1, 'Amount must be at least 1 token'),
});

export const sellSharesSchema = z.object({
  betId: z.string().min(1, 'Bet ID is required'),
  shares: z.number().min(0.01, 'Shares must be greater than 0').optional(),
});

export const resolveMarketSchema = z.object({
  marketId: z.string().min(1, 'Market ID is required'),
  resolution: z.enum(['YES', 'NO'], { message: 'Resolution must be YES or NO' }),
});

export type CreateMarketInput = z.infer<typeof createMarketSchema>;
export type PlaceBetInput = z.infer<typeof placeBetSchema>;
export type SellSharesInput = z.infer<typeof sellSharesSchema>;
export type ResolveMarketInput = z.infer<typeof resolveMarketSchema>;

