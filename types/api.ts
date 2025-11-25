import { Market } from './market';
import { Bet } from './bet';
import { UserWithStats } from './user';

export interface MarketsResponse {
  markets: Market[];
}

export interface MarketResponse extends Market {
  bets?: Bet[];
}

export interface BetsResponse {
  bets: Bet[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  tokenBalance: number;
  totalBets: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

export interface UserResponse {
  user: UserWithStats;
}

