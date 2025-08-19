import { useBoardState } from './hooks/useBoardState';
import { BoardRow } from './components/Board/BoardRow';

export function Board({ onMove, gameStatus, lastMove, referee }) {
  const currentPlayer = referee.getCurrentPlayer();
  
  const { 
    localState, 
    handleSquareClick, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useBoardState(referee, onMove);

  return (
        <BoardRow
          referee={referee}
          currentPlayer={currentPlayer}
          lastMove={lastMove}
          localState={localState}
          onClick={(i) => handleSquareClick(i, gameStatus)}
          onMouseEnter={(i) => handleMouseEnter(i, gameStatus, referee.getCurrentBoard(), currentPlayer)}
          onMouseLeave={handleMouseLeave}
        />
  );
}