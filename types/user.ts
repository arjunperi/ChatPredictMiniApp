export interface User {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  tokenBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalBets: number;
  marketsCreated: number;
  totalWinnings: number;
}

export interface UserWithStats extends User {
  stats: UserStats;
}

