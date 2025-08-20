import Entity from './Entity';
import BaseEntity from './BaseEntity';

export default class Pawn extends BaseEntity {
  enPassantTarget = null;

  constructor(type, color, position, squares, enPassantTarget) {
    super(type, color, position, squares);
    this.enPassantTarget = enPassantTarget;
  }

  isValidMove(to) {
    const from = this.position;
    const squares = this.squares;

    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    // Determine direction based on color
    const direction = this.color === 'white' ? -1 : 1;
    const startRow = this.color === 'white' ? 6 : 1;

    // Forward move (no capture)
    if (fromCol === toCol) {
      // Single step forward
      if (toRow === fromRow + direction && squares[to] === '') {
        return true;
      }

      // Double step from starting position
      if (fromRow === startRow && 
          toRow === fromRow + (2 * direction) && 
          squares[to] === '' && 
          squares[from + (8 * direction)] === '' && // Check if the square in between is empty
          this.isPathClear(to)) {
        return true;
      }
    }

    // Capture (diagonal move with opponent piece)
    if (colDiff === 1 && toRow === fromRow + direction) {
      // Regular capture
      if (squares[to] !== '' && Entity.getColorByEntity(squares[to]) !== this.color) {
        return true;
      }
      
      // En passant capture
      if (this.enPassantTarget === to && squares[to] === '') {
        const enPassantCaptureRow = this.color === 'white' ? toRow + 1 : toRow - 1;
        const enPassantCaptureSquare = enPassantCaptureRow * 8 + toCol;
        
        if (squares[enPassantCaptureSquare] !== '' && 
            Entity.getColorByEntity(squares[enPassantCaptureSquare]) !== this.color &&
            squares[enPassantCaptureSquare].toLowerCase() === 'p') {
          return true;
        }
      }
    }

    return false;
  }

  isEnPassant(to) {
    const fromRow = Math.floor(this.position / 8);
    const fromCol = this.position % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    const direction = this.color === 'white' ? -1 : 1;

    // Check if this is an en passant move
    return (colDiff === 1 && 
            toRow === fromRow + direction && 
            this.enPassantTarget === to && 
            this.squares[to] === '');
  }

  isStartingPosition() {
    const fromRow = Math.floor(this.position / 8);
    const startRow = this.color === 'white' ? 6 : 1;
    return fromRow === startRow;
  }

  isDoubleStep(to) {
    const fromRow = Math.floor(this.position / 8);
    const toRow = Math.floor(to / 8);
    const direction = this.color === 'white' ? -1 : 1;
    
    return (this.isStartingPosition() && 
            toRow === fromRow + (2 * direction));
  }
}