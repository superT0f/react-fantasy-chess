import { useBoardState } from './hooks/useBoardState';
import { BoardRow } from './components/Board/BoardRow';
import { Move, Square } from 'chess.js';
import { LastMove } from './types/chess';

interface BoardProps {
  onMove: (move: Move) => void;
  gameStatus: string;
  lastMove: LastMove | null;
  onPromotion: (from: Square, to: Square) => void;
}

export function Board({ onMove, gameStatus, lastMove, onPromotion }: BoardProps) {
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
          onClick={(i: any) => handleSquareClick(i, gameStatus)}
          onMouseEnter={(i: any) => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
        />
  );
}