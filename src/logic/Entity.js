
import { Pawn } from "./Pawn";
import { Rook } from "./pieces/Rook";
import { Knight } from "./pieces/Knight";
import { Bishop } from "./pieces/Bishop";
import { Queen } from "./pieces/Queen";
import { King } from "./pieces/King";

export default class Entity {
  static fromChar(c, position) {
    const type = c.toLowerCase();
    const color = c === c.toUpperCase() ? 'white' : 'black';
    // if (!['p', 'r', 'n', 'b', 'q', 'k'].includes(type)) {
    //   throw new Error(`Invalid entity type: ${c}`);
    // }

    switch (type) {
      case 'p':
        return new Pawn(type, color, position);
      case 'r':
        return new Rook(type, color, position);
      case 'n':
        return new Knight(type, color, position);
      case 'b':
        return new Bishop(type, color, position);
      case 'q':
        return new Queen(type, color, position);
      case 'k':
        return new King(type, color, position);
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
    
  }
  constructor(type, color, position) {
    this.type = type.toLowerCase();
    this.color = color;
    // assets.assert(['white', 'black'].includes(this.color), 'Invalid color');
    this.position = position;
    // assets.assert(Number.isInteger(this.position) && this.position >= 0 && this.position < 64, 'Invalid position');
    this.hasMoved = false;

    this.fromRow = Math.floor(this.position / 8);
    this.fromCol = this.position % 8;
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
      if (squares[index] !== '') return false;

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

  isValidMove(to) {
    // @see Implementation in subclasses
    throw new Error('isValidMove must be implemented in subclasses');
    return [];
  }
}