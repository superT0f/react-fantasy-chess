import Entity from './components/Entity';
import PgnNotation from './logic/PgnNotation';

export function Square({
  value,
  squareIndex,
  isSelected,
  onSquareClick,
  onMouseEnter,
  onMouseLeave,
  isValidMove,
  isKingInCheck,
  isOpponentPiece,
  isEnPassantTarget
}) {
  const row = Math.floor(squareIndex / 8);
  const col = squareIndex % 8;

  const isPositionsBottom = row == 7;
  const isPositionsRight = col == 7;
  return (
    <button
      className={`square 
        ${isSelected ? 'selected' : ''} 
        ${isValidMove ? 'valid-move' : ''}
        ${isValidMove && isOpponentPiece ? 'move-indicator-opponent' : ''}
        ${isValidMove && !isOpponentPiece ? 'move-indicator' : ''}
        ${isKingInCheck ? 'check' : ''}
        ${isEnPassantTarget ? 'en-passant-target' : ''}
        `}
      onClick={onSquareClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isPositionsBottom &&
        <div className="positions bottom"> {PgnNotation.getLetter(squareIndex)}</div>}
      {isPositionsRight &&
        <div className="positions right"> {PgnNotation.getNumber(squareIndex)}</div>}
      <Entity entity={value} />
    </button>
  );
}