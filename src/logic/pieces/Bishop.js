import BaseEntity from '../BaseEntity';

export default class Bishop extends BaseEntity {
  isValidMove(to) {
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - this.fromRow);
    const colDiff = Math.abs(toCol - this.fromCol);

    return this.isPathClear(to) &&
          rowDiff === colDiff;
  }
}