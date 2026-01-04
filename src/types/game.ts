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
}
