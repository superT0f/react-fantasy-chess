import Entity from './Entity';
import PgnNotation from './PgnNotation';

export default class BaseEntity {
  constructor(referee, position) {
    this.referee = referee;
    this.position = position;
  }

  get squares() {
    return this.referee.getCurrentBoard();
  }

  setType(newType) {
    this.type =newType;
  }

  setColor(newColor) {
    this.color = newColor;
  }

  isPathClear(to) {
    if (this.type === 'n') return true;

    const toRow = Math.floor(to / 8);
    const toCol = to % 8;

    const rowStep = Math.sign(toRow - this.fromRow);
    const colStep = Math.sign(toCol - this.fromCol);

    let currentRow = this.fromRow + rowStep;
    let currentCol = this.fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      const index = currentRow * 8 + currentCol;
      if (this.squares[index] !== '') return false;

      currentRow += rowStep;
      currentCol += colStep;
    }

    return this.squares[to] === '' ||
      Entity.getColorByEntity(this.squares[to]) !== this.color;
  }

  getSymbol() {
    const symbols = {
      'p': '',
      'r': 'R',
      'n': 'N',
      'b': 'B',
      'q': 'Q',
      'k': 'K'
    };

    return this.color === 'white' ? symbols[this.type].toUpperCase() : symbols[this.type];
  }

  isEnPassant(to) {
    return false;
  }

  isValidMove(to) {
    throw new Error('isValidMove must be implemented in subclasses');
  }
}