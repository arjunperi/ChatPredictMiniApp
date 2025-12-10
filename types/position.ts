export interface BlendedPosition {
  outcome: 'YES' | 'NO';
  totalShares: number;      // Rounded to 8 decimals
  totalCost: number;         // Rounded to 2 decimals
  averageCost: number;       // Rounded to 2 decimals
  currentPrice: number;      // Rounded to 2 decimals
  estimatedValue: number;    // Rounded to 2 decimals
  pnl: number;              // Rounded to 2 decimals
}

