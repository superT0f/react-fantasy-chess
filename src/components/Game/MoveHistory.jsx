// src/components/Game/MoveHistory.jsx
export function MoveHistory({ history, onJumpToMove }) {
  const moves = [];
  
  if (history.length >= 2) {
    for (let i = 1; i < history.length; i += 2) {
      const whiteMove = history[i];
      const blackMove = history[i + 1];
      let description = ``;

      if (whiteMove && whiteMove.pgn && whiteMove.pgn !== 'Start') {
        description += ` ${whiteMove.pgn}`;
      }
      if (blackMove && blackMove.pgn) {
        description += `   -   ${blackMove.pgn}`;
      }

      moves.push(
        <li key={i}>
          <button className="move" onClick={() => onJumpToMove(i)}>
            {description}
          </button>
        </li>
      );
    }
  }

  return <ol>{moves}</ol>;
}