import PgnNotation from "../../logic/PgnNotation";
import { Square } from "../../Square";
import Entity from "../../logic/Entity";
export function BoardRow({
  referee,
  currentPlayer,
  lastMove,
  localState,
  onClick,
  onMouseEnter,
  onMouseLeave
}) {
  return (
    <>
      {Array(8).fill(null).map((_, row) => (
        <div className="board-row" key={row}>
          {Array(8).fill(null).map((_, col) => {
            const squareIndex = row * 8 + col;
            var isValidMove = localState.validMoves.includes(squareIndex);
            const entityChar = referee.getSquare(squareIndex);
            const isPlayerEntity = Entity.getColorByEntity(entityChar) === currentPlayer;
            const isKingInCheck = entityChar && entityChar.toLowerCase() === 'k' &&
              referee.isCheck(referee.getCurrentBoard(), currentPlayer) && isPlayerEntity;

            const isLastMoveFrom = lastMove?.from === PgnNotation.idxToXY(squareIndex);
            const isLastMoveTo = lastMove?.to === PgnNotation.idxToXY(squareIndex);
            const isCheckmate =  isKingInCheck && referee.isCheckmate(referee.getCurrentBoard(), currentPlayer);
            return (
              <Square
                key={squareIndex}
                squareIndex={squareIndex}
                value={entityChar}
                onSquareClick={() => onClick(squareIndex)}
                onMouseEnter={() => onMouseEnter(squareIndex)}
                onMouseLeave={() => onMouseLeave(localState.selectedSquare !== null)}
                isSelected={localState.selectedSquare === squareIndex}
                isValidMove={isValidMove}
                isKingInCheck={isKingInCheck}
                isCheckmate={isCheckmate}
                isAnimated={referee.lastMove === squareIndex}
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