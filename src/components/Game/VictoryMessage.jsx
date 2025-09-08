import { BLACK, WHITE } from "chess.js";

export function VictoryMessage({ gameStatus, winner, onPlayAgain }) {

  const messages = {
    checkmate: "WINS BY CHECKMATE!",
    stalemate: "STALEMATE! IT'S A DRAW!",
    timeout: "WINS BY TIMEOUT!"
  };

  const emojis = {
    WHITE: '🎉👑🎉',
    BLACK: '🎉🏴🎉',
    draw: '🤝'
  };

  if (gameStatus === 'playing') {
    return null;
  }

  return (
    <div className="victory-message">
      <div className="victory-text">
        <div className="victory-text-winner">
        {winner}
        </div>
        {messages[gameStatus]}
      </div>
      <div className="victory-emoji">
        {gameStatus === 'stalemate' ? emojis.draw : emojis[winner]}
      </div>
      <button className="play-again" onClick={onPlayAgain}>
        PLAY AGAIN
      </button>
    </div>
  );
}