import { useGameRoom } from '@/hooks/useGameRoom';
import JoinRoom from '@/components/JoinRoom';
import GameRoom from '@/components/GameRoom';
import SpectatorView from '@/components/SpectatorView';

const Index = () => {
  const {
    room, guesses, player, spectators, loading,
    joinRoom, joinAsSpectator, setSecret, makeGuess, leaveRoom,
  } = useGameRoom();

  if (!room || !player) {
    return <JoinRoom onJoin={joinRoom} onSpectate={joinAsSpectator} loading={loading} />;
  }

  if (player.isSpectator) {
    return (
      <SpectatorView
        room={room} guesses={guesses} player={player}
        spectators={spectators} onLeave={leaveRoom}
      />
    );
  }

  return (
    <GameRoom
      room={room} guesses={guesses} player={player}
      loading={loading} onSetSecret={setSecret}
      onMakeGuess={makeGuess} onLeave={leaveRoom}
    />
  );
};

export default Index;
