import { Bet } from '@/types/bet';

export interface BlendedPosition {
  outcome: 'YES' | 'NO';
  totalShares: number;      // Rounded to 8 decimals
  totalCost: number;         // Rounded to 2 decimals
  averageCost: number;       // Rounded to 2 decimals
  currentPrice: number;      // Rounded to 2 decimals
  estimatedValue: number;    // Rounded to 2 decimals
  pnl: number;              // Rounded to 2 decimals
}

/**
 * Round to specified decimal places
 */
export function roundToDecimals(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Compute blended position from array of bets
 * Centralizes position calculation logic to avoid inconsistencies
 */
export function computeBlendedPosition(
  bets: Bet[],
  currentPrice: number
): BlendedPosition | null {
  if (bets.length === 0) return null;

  const totalShares = bets.reduce((sum, bet) => sum + bet.shares, 0);
  const totalCost = bets.reduce((sum, bet) => sum + bet.amount, 0);
  
  if (totalShares === 0) return null;

  const averageCost = totalCost / totalShares;
  const estimatedValue = totalShares * currentPrice;
  const pnl = estimatedValue - totalCost;

  return {
    outcome: bets[0].outcome, // All bets should have same outcome
    totalShares: roundToDecimals(totalShares, 8), // 6-8 decimals for shares
    totalCost: roundToDecimals(totalCost, 2),     // 2 decimals for money
    averageCost: roundToDecimals(averageCost, 2),
    currentPrice: roundToDecimals(currentPrice, 2),
    estimatedValue: roundToDecimals(estimatedValue, 2),
    pnl: roundToDecimals(pnl, 2),
  };
}

