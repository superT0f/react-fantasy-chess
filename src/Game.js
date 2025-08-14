import { useState } from 'react';
import { Board } from './Board';
import PgnNotation from './logic/PgnNotation';
import Entity from './logic/Entity';

export default function Game() {
  const initialChessBoard = [
    'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
    'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
    'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
  ];

  const [history, setHistory] = useState([{
    squares: initialChessBoard,
    pgn : 'Start'
  }]);

  const [currentMove, setCurrentMove] = useState(0);
  const current = history[currentMove];
  const currentSquares = current ? current.squares : initialChessBoard;
  const currentPlayer = currentMove % 2 === 0 ? 'white' : 'black';

  function handleMove(nextSquares,
    from, to, captured, isEnPassant) {
    const pgn = PgnNotation.getMoveNotation(
      from, 
      to, 
      currentSquares[from], 
      captured,
      isEnPassant
    );
    if (Entity.isCheck(nextSquares, currentPlayer)) {
      return;
    }
    const nextHistory = [...history.slice(0, currentMove + 1), {
      squares: nextSquares,
      pgn: pgn
    }];
    if (isEnPassant) {
      nextHistory[captured] = '';
    }
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }



  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }
  const moves = [];
  if (history.length >= 2)
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
        <button className="move" onClick={() => jumpTo(i)}>{description}</button>
      </li>
    );
  }

return (
  <div className="game">
    <div className="board-container">
      
      <div className="game-content">
        <div className="game-board">
          <Board
            currentPlayer={currentPlayer}
            squares={currentSquares}
            onMove={handleMove} 
             />
        </div>
        <div className="game-info">
          <div className="status">to move : <span>{currentPlayer}</span></div>
          <ol>{moves}</ol>
        </div>
      </div>
    </div>
  </div>
);
}
