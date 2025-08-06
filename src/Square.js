import Entity from './components/Entity';

export function Square({ 
  value, 
  isSelected, 
  onSquareClick, 
  onMouseEnter, 
  onMouseLeave, 
  isValidMove,
  isOpponentPiece,
  isEnPassantTarget
}) {
  const indicator = isOpponentPiece ? "move-indicator-opponent" : "move-indicator";

  return (
    <button 
      className={`square 
        ${isSelected ? 'selected' : ''} 
        ${isValidMove ? 'valid-move' : ''}
        ${isValidMove && isOpponentPiece ? 'move-indicator-opponent' : ''}
        ${isValidMove && !isOpponentPiece ? 'move-indicator' : ''}
        ${isEnPassantTarget ? 'en-passant-target' : ''}`}
      onClick={onSquareClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Entity entity={value} />
      {/* {isValidMove && <div className={indicator}></div>} */}
    </button>
  );
}