import { Square } from 'chess.js';
import PgnNotation from "../../logic/PgnNotation";
import { SquareUI } from "./SquareUI";
import chessEngine from '../../logic/chessEngine';
import { LastMove } from '../../types/chess';

interface BoardRowProps {
  lastMove: LastMove | null
  localState: {
    validSquares: Square[];
    selectedSquare: Square | null;
  };
  onClick: (square: Square) => void;
  onMouseEnter: (square: Square) => void;
  onMouseLeave: (isSelected: boolean) => void;
}

export function BoardRow({
  lastMove,
  localState,
  onClick,
  onMouseEnter,
  onMouseLeave
}: BoardRowProps) {
  const chess = chessEngine.getChess();

  return (
    <>
      {Array(8).fill(null).map((_, row) => (
        <div className="board-row" key={row}>
          {Array(8).fill(null).map((_, col) => {
            const squareIndex = row * 8 + col;
            const square = PgnNotation.idxToXY(squareIndex);
            if (!square) return null; // Handle potential null square

            const piece = chess.get(square);
            const isValidMove = localState.validSquares.includes(square);
            const isPlayerEntity = piece && piece.color === chess.turn();
            const isKingInCheck = piece && (piece.type === 'k'
              && chess.isCheck() && isPlayerEntity) || false;

            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isCheckmate = isKingInCheck && chess.isCheckmate();

            return (
              <SquareUI
                key={square}
                squareIndex={squareIndex}
                piece={piece}
                onSquareClick={() => onClick(square)}
                onMouseEnter={() => onMouseEnter(square)}
                onMouseLeave={() => onMouseLeave(localState.selectedSquare !== null)}
                isSelected={localState.selectedSquare === square}
                isValidMove={isValidMove}
                isKingInCheck={isKingInCheck}
                isCheckmate={isCheckmate}
                // isAnimated={chess.history().slice(-1)[0]?.includes(square)}
                isOpponentPiece={piece ? piece.color !== chess.turn() : false}
                isLastMoveFrom={isLastMoveFrom}
                isLastMoveTo={isLastMoveTo}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}