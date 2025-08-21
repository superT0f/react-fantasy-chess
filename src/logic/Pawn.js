import Entity from './Entity';
import BaseEntity from './BaseEntity';

export default class Pawn extends BaseEntity {
  isValidMove(to) {
    const from = this.position;
    const squares = this.squares;

    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    const direction = this.color === 'white' ? -1 : 1;
    const startRow = this.color === 'white' ? 6 : 1;

    // Normal move forward
    if (fromCol === toCol) {
      if (toRow === fromRow + direction && squares[to] === '')
        return true;

      if (fromRow === startRow &&
        toRow === fromRow + 2 * direction &&
        squares[to] === '' &&
        this.isPathClear(to)) {
        return true;
      }
    }

    const entityChar = squares[to];
    const isNotSameColorWithTo = Entity.getColorByEntity(entityChar) !== this.color;
    // Capture
    if (toRow === fromRow + direction && colDiff === 1 &&
      squares[to] !== '' &&
      isNotSameColorWithTo) {
      return true;
    }

    // En passant
    if (toRow === fromRow + direction && colDiff === 1 && this.isEnPassant(to)) {
      return true;
    }

    return false;
  }

  isEnPassant(to) {
    const fromRow = Math.floor(this.position / 8);
    const fromCol = this.position % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    const direction = this.color === 'white' ? -1 : 1;

    if (colDiff !== 1 || toRow !== fromRow + direction) return false;

    // Check if the last move was a double step pawn move on the adjacent file
    const history = this.referee.getHistory();
    if (history.length < 2) return false;

    const lastMove = history[history.length - 1];
    if (!lastMove.entityChar || lastMove.entityChar.toLowerCase() !== 'p') return false;

    const lastMoveFromRow = Math.floor(lastMove.from / 8);
    const lastMoveToRow = Math.floor(lastMove.to / 8);
    const lastMoveCol = lastMove.to % 8;

    // Check if last move was a double step pawn move
    const isDoubleStep = Math.abs(lastMoveToRow - lastMoveFromRow) === 2;
    
    // Check if the pawn moved to the adjacent file
    const isAdjacentFile = Math.abs(lastMoveCol - fromCol) === 1 && lastMoveCol === toCol;
    
    // Check if the pawn landed on the same row as this pawn
    const isSameRow = lastMoveToRow === fromRow;

    return isDoubleStep && isAdjacentFile && isSameRow;
  }

  isStartingPosition() {
    const fromRow = Math.floor(this.position / 8);
    const startRow = this.color === 'white' ? 6 : 1;
    return fromRow === startRow;
  }

  isDoubleStep(to) {
    const toRow = Math.floor(to / 8);
    return this.isStartingPosition() && Math.abs(toRow - Math.floor(this.position / 8)) === 2;
  }
}