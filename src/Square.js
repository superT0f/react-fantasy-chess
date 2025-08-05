import Piece from './components/Piece';


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
        ${isEnPassantTarget ? 'en-passant-target' : ''}`}
      onClick={onSquareClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Piece piece={value} />
      {isValidMove && <div className={indicator}></div>}
    </button>
  );
}




