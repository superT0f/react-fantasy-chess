import Entity from './Entity';
import BaseEntity from './BaseEntity';

export default class Pawn extends BaseEntity {
  isValidMove(to) {
    const from = this.position;
    
    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    const direction = this.color === 'white' ? -1 : 1;
    const startRow = this.color === 'white' ? 6 : 1;
    const enPassantRow = this.color === 'white' ? 3 : 4;

    if (fromCol === toCol) {
      if (toRow === fromRow + direction && this.squares[to] === '')
        return true;

      if (fromRow === startRow &&
        toRow === fromRow + 2 * direction &&
        this.squares[to] === '' &&
        this.isPathClear(to))
        return true;
    }

    if (colDiff === 1 && rowDiff === 1 &&
      this.squares[to] !== '' &&
      Entity.getColorByEntity(this.squares[to]) !== this.color) {
      return true;
    }

    if (colDiff === 1 && rowDiff === 1 &&
      toRow === enPassantRow &&
      to === this.enPassantTarget) {

      const adjacentCol = toCol;
      const adjacentRow = fromRow;
      const adjacentIndex = adjacentRow * 8 + adjacentCol;

      if (adjacentIndex === this.lastDoubleStepPawn) {
        return true;
      }
    }
    return false;
  }
}