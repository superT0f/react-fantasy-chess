import BaseEntity from '../BaseEntity';

export default class Rook extends BaseEntity {
  isValidMove(to, squares = this.squares) {
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;

    return this.isPathClear(to,squares) &&
      (this.fromRow === toRow || this.fromCol === toCol);
  }
}