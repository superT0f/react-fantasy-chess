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

    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    const direction = this.color === 'white' ? -1 : 1;
    const startRow = this.color === 'white' ? 6 : 1;


    if (fromCol === toCol) {
      if (toRow === fromRow + direction && this.squares[to] === '')
        return true;

      if (fromRow === startRow &&
        toRow === fromRow + 2 * direction &&
        this.squares[to] === '' &&
        this.isPathClear(to)) {
        return true;
      }
    }

    if (colDiff === 1 && rowDiff === 1 && fromRow !== startRow &&
      this.enPassantTarget === to) {

      return true;
    }


    if (colDiff === 1 && rowDiff === 1 &&
      this.squares[to] !== '' &&
      Entity.getColorByEntity(this.squares[to]) !== this.color) {
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
    const startRow = this.color === 'white' ? 6 : 1;

    const isEnPassant = (colDiff === 1 && rowDiff === 1 && fromRow !== startRow &&
      this.enPassantTarget === to);
    return isEnPassant;
  }

  isStartingPosition() {
    const fromRow = Math.floor(this.position / 8);
    const startRow = this.color === 'white' ? 6 : 1;
    return fromRow === startRow;
  }

  isDoubleStep(to) {
    const toRow = Math.floor(to / 8);
    const doubleStep = (this.isStartingPosition() &&
      Math.abs(toRow - Math.floor(this.position / 8)) === 2);

    return doubleStep;
  }
}