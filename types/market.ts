export type MarketStatus = 'ACTIVE' | 'RESOLVED' | 'CANCELLED' | 'CLOSED';
export type Resolution = 'YES' | 'NO';

export interface Market {
  id: string;
  question: string;
  creatorId: string;
  sharesYes: number;
  sharesNo: number;
  liquidity: number;
  status: MarketStatus;
  resolution: Resolution | null;
  resolvedAt: Date | null;
  closesAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  chatId: string;
  messageId: string | null;
  probabilityYes?: number;
  creator?: {
    id: string;
    username: string | null;
    firstName: string | null;
  };
  _count?: {
    bets: number;
  };
}

