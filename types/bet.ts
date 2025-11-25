export type Outcome = 'YES' | 'NO';

export interface Bet {
  id: string;
  userId: string;
  marketId: string;
  outcome: Outcome;
  amount: number;
  shares: number;
  priceAtBet: number;
  createdAt: Date;
  user?: {
    id: string;
    username: string | null;
    firstName: string | null;
  };
  market?: {
    id: string;
    question: string;
    status: string;
  };
}

