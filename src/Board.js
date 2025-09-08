import { useBoardState } from './hooks/useBoardState';
import { BoardRow } from './components/Board/BoardRow';

export function Board({ onMove, gameStatus, lastMove, onPromotion}) {
  const { 
    localState, 
    handleSquareClick, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useBoardState(onMove, onPromotion);

  return (
        <BoardRow
          lastMove={lastMove}
          localState={localState}
          onClick={(i) => handleSquareClick(i, gameStatus)}
          onMouseEnter={(i) => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
        />
  );
}