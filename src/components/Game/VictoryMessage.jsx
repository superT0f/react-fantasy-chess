// src/components/Game/VictoryMessage.jsx
export function VictoryMessage({ gameStatus, winner, onPlayAgain }) {
  const messages = {
    checkmate: `${winner === 'white' ? 'WHITE' : 'BLACK'} WINS BY CHECKMATE!`,
    stalemate: "STALEMATE! IT'S A DRAW!",
    timeout: `${winner === 'white' ? 'WHITE' : 'BLACK'} WINS BY TIMEOUT!`
  };

  const emojis = {
    white: '🎉👑🎉',
    black: '🎉🏴🎉',
    draw: '🤝'
  };

  if (gameStatus === 'playing') {
    return null;
  }

  return (
    <div className="victory-message">
      <div className="victory-text">{messages[gameStatus]}</div>
      <div className="victory-emoji">
        {gameStatus === 'stalemate' ? emojis.draw : emojis[winner]}
      </div>
      <button className="play-again" onClick={onPlayAgain}>
        PLAY AGAIN
      </button>
    </div>
  );
}