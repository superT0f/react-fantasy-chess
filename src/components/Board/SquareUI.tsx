import { Piece } from 'chess.js';
import EntityUI from './EntityUI';
import PgnNotation from "../../logic/PgnNotation";

interface SquareUIProps {
  piece: Piece | undefined;
  squareIndex: number;
  isSelected: boolean;
  onSquareClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isValidMove: boolean;
  isKingInCheck: boolean;
  isCheckmate: boolean;
  isOpponentPiece: boolean;
  isEnPassantTarget?: boolean;
  isLastMoveFrom: boolean;
  isLastMoveTo: boolean;
}

export function SquareUI({
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
  isEnPassantTarget = false,
  isLastMoveFrom,
  isLastMoveTo,
}: SquareUIProps) {
  const squareLabel = PgnNotation.idxToXY(squareIndex);
  
  const row = Math.floor(squareIndex / 8);
  const col = squareIndex % 8;

  const isPositionsBottom = row === 7;
  const isPositionsRight = col === 7;

  return (
    <button
      title={squareLabel}
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