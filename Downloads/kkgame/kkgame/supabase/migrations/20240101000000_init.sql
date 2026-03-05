-- =============================================
-- SECRET NUMBERS GAME — Full Supabase Schema
-- Run this once in Supabase SQL Editor
-- =============================================

-- 1. game_rooms
CREATE TABLE IF NOT EXISTS public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','playing','finished')),
  player1_id TEXT, player1_name TEXT, player1_secret TEXT,
  player2_id TEXT, player2_name TEXT, player2_secret TEXT,
  current_turn TEXT, winner_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read game rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert game rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update game rooms" ON public.game_rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete game rooms" ON public.game_rooms FOR DELETE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;

-- 2. guesses
CREATE TABLE IF NOT EXISTS public.guesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL, player_name TEXT NOT NULL,
  guess TEXT NOT NULL, hint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.guesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read guesses" ON public.guesses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert guesses" ON public.guesses FOR INSERT WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.guesses;

-- 3. player_stats
CREATE TABLE IF NOT EXISTS public.player_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL UNIQUE,
  wins INTEGER NOT NULL DEFAULT 0, losses INTEGER NOT NULL DEFAULT 0,
  total_games INTEGER NOT NULL DEFAULT 0, total_guesses INTEGER NOT NULL DEFAULT 0,
  best_guesses INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stats" ON public.player_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can insert stats" ON public.player_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update stats" ON public.player_stats FOR UPDATE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_stats;

-- 4. match_history
CREATE TABLE IF NOT EXISTS public.match_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_name TEXT NOT NULL, player1_name TEXT, player2_name TEXT, winner_name TEXT,
  player1_guesses INTEGER DEFAULT 0, player2_guesses INTEGER DEFAULT 0,
  duration_seconds INTEGER, started_at TIMESTAMP WITH TIME ZONE, ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view match history" ON public.match_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert match history" ON public.match_history FOR INSERT WITH CHECK (true);

-- 5. spectators
CREATE TABLE IF NOT EXISTS public.spectators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  spectator_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.spectators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view spectators" ON public.spectators FOR SELECT USING (true);
CREATE POLICY "Anyone can join as spectator" ON public.spectators FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can leave spectators" ON public.spectators FOR DELETE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.spectators;
