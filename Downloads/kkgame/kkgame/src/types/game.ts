export interface GameRoom {
  id: string;
  room_name: string;
  status: 'waiting' | 'playing' | 'finished';
  player1_id: string | null;
  player1_name: string | null;
  player1_secret: string | null;
  player2_id: string | null;
  player2_name: string | null;
  player2_secret: string | null;
  current_turn: string | null;
  winner_name: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  last_activity_at?: string | null;
}

export interface Guess {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  guess: string;
  hint: string;
  created_at: string;
}

export interface Player {
  id: string;
  name: string;
  isPlayer1: boolean;
  isSpectator?: boolean;
}

export interface PlayerStats {
  id: string;
  player_name: string;
  wins: number;
  losses: number;
  total_games: number;
  total_guesses: number;
  best_guesses: number | null;
  created_at: string;
  updated_at: string;
}

export interface MatchHistory {
  id: string;
  room_name: string;
  player1_name: string | null;
  player2_name: string | null;
  winner_name: string | null;
  player1_guesses: number;
  player2_guesses: number;
  duration_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface Spectator {
  id: string;
  room_id: string;
  spectator_name: string;
  joined_at: string;
}
