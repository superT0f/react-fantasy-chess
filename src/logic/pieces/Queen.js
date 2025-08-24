import BaseEntity from '../BaseEntity';

export default class Queen extends BaseEntity {
  isValidMove(to, squares=this.squares) {
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - this.fromRow);
    const colDiff = Math.abs(toCol - this.fromCol);
    let isValid = false;
    if (this.isPathClear(to, squares)) {
      isValid = (this.fromRow === toRow || this.fromCol === toCol || rowDiff === colDiff);
    }
    return isValid;
  }
}