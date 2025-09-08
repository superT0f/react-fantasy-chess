import EntityUI from './EntityUI';
import PgnNotation from "../../logic/PgnNotation";

export function SquareUI({
  /**
 * @type {Piece | null}
 */
  piece,
  squareIndex,
  isSelected,
  onSquareClick,
  onMouseEnter,
  onMouseLeave,
  isValidMove,
  isKingInCheck,
  isCheckmate,
  isOpponentPiece,
  isEnPassantTarget,
  isLastMoveFrom,
  isLastMoveTo,
}) {
  const squareLabel = PgnNotation.idxToXY(squareIndex);
  
  const row = Math.floor(squareIndex / 8);
  const col = squareIndex % 8;

  const isPositionsBottom = row == 7;
  const isPositionsRight = col == 7;

  return (
    <button
      title={squareLabel}
      alt={squareLabel}
      aria-label={squareLabel}
      className={`square 
        ${isSelected ? 'selected' : ''} 
        ${isValidMove ? 'valid-move' : ''}
        ${isValidMove && isOpponentPiece ? 'move-indicator-opponent' : ''}
        ${isValidMove && !isOpponentPiece ? 'move-indicator' : ''}
        ${isKingInCheck ? 'check' : ''}
        ${isCheckmate ? 'checkmate' : ''}
        ${isEnPassantTarget ? 'en-passant-target' : ''}
        ${isLastMoveFrom ? 'last-move-from' : ''}
        ${isLastMoveTo ? 'last-move-to' : ''}
        `}
      onClick={onSquareClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isPositionsBottom &&
        <div className="positions bottom"> {PgnNotation.getLetter(squareIndex)}</div>}
      {isPositionsRight &&
        <div className="positions right"> {PgnNotation.getNumber(squareIndex)}</div>}
      <EntityUI piece={piece} />
    </button>
  );
}