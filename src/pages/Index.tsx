import { useGameRoom } from '@/hooks/useGameRoom';
import JoinRoom from '@/components/JoinRoom';
import GameRoom from '@/components/GameRoom';

const Index = () => {
  const {
    room,
    guesses,
    player,
    loading,
    joinRoom,
    setSecret,
    makeGuess,
    leaveRoom,
  } = useGameRoom();

  // Show join screen if not in a room
  if (!room || !player) {
    return <JoinRoom onJoin={joinRoom} loading={loading} />;
  }

  // Show game room
  return (
    <GameRoom
      room={room}
      guesses={guesses}
      player={player}
      loading={loading}
      onSetSecret={setSecret}
      onMakeGuess={makeGuess}
      onLeave={leaveRoom}
    />
  );
};

export default Index;
