// src/logic/Piece.js

export default class Piece {
  constructor(type, color, position) {
    this.type = type.toLowerCase();
    this.color = color;
    this.position = position;
    this.hasMoved = false;
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

  getValidMoves(board) {
    // @see Implementation in subclasses
    throw new Error('getValidMoves must be implemented in subclasses');
    return [];
  }
}