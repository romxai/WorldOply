export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  stats?: UserStats;
  ownedTiles?: number;
}

export interface UserStats {
  level: number;
  experience: number;
  coins: number;
  resources?: {
    [key: string]: number;
  };
} 