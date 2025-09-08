// src/components/Game/MoveHistory.jsx
export function MoveHistory({ history, onJumpToMove }) {
  const moves = [];
  
  if (history.length >= 1) {
    for (let i = 0; i < history.length; i += 2) {
      const whiteMove = history[i];
      const blackMove = history[i + 1];
      let description = ``;

      if (whiteMove) {
        description += ` ${whiteMove}`;
      }
      if (blackMove) {
        description += `   -   ${blackMove}`;
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