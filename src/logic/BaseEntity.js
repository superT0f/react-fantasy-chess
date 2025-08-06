export default class BaseEntity {
  constructor(type, color, position, squares, enPassantTarget = null, lastDoubleStepPawn = null) {
    this.type = type.toLowerCase();
    this.color = color;
    this.position = position;
    this.hasMoved = false;
    this.fromRow = Math.floor(this.position / 8);
    this.fromCol = this.position % 8;
    this.squares = squares;
    this.enPassantTarget = enPassantTarget;
    this.lastDoubleStepPawn = lastDoubleStepPawn;
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
    return true;
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

}