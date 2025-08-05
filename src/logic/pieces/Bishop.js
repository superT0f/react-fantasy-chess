import Entity from './Entity';

export class Bishop extends Entity {
  isValidMove(to) {
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    return isPathClear(from, to, pieceType) &&
          rowDiff === colDiff;
  }
}