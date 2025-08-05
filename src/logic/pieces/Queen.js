import Entity from './Entity';

export class Queen extends Entity {
  isValidMove(to) {
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return isPathClear(from, to, pieceType) &&
          (this.fromRow === toRow || this.fromCol === toCol || rowDiff === colDiff);
  }
}