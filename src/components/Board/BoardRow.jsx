import PgnNotation from "../../logic/PgnNotation";
import { SquareUI } from "./SquareUI";
import chessEngine from '../../logic/chessEngine';
import { Square, Chess, Piece } from 'chess.js';
export function BoardRow({
  lastMove,
  localState,
  onClick,
  onMouseEnter,
  onMouseLeave
}) {
  /** @type {Chess} */
  const chess = chessEngine.getChess();
  return (
    <>
      {Array(8).fill(null).map((_, row) => (
        <div className="board-row" key={row}>
          {Array(8).fill(null).map((_, col) => {
            const squareIndex = row * 8 + col;
            /**
             * @type {Square | null}
             */
            const square = PgnNotation.idxToXY(squareIndex);
            /**
             * @type {Piece | null}
             */
            const piece = chess.get(square);
            var isValidMove = localState.validMoves.includes(square);
            const isPlayerEntity = piece && piece.color === chess.turn();
            const isKingInCheck = piece && piece.type === 'k'
              && chess.isCheck() && isPlayerEntity;

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
                isAnimated={chess.history[-1] === square}
                isOpponentPiece={localState.isOpponentPiece}
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