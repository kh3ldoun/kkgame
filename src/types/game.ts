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

  // ⏱️ Timestamps (ISO strings – Supabase friendly)
  created_at: string;        // موجود – لا نغيره
  started_at: string | null; // موجود
  ended_at: string | null;   // موجود

  // 🧹 CLEANUP SUPPORT (جديد)
  last_activity_at?: string | null; 
}
