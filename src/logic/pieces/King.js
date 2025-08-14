import BaseEntity from '../BaseEntity';

// src/logic/pieces/King.js
export default class King extends BaseEntity {
  isValidMove(to) {
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - this.fromRow);
    const colDiff = Math.abs(toCol - this.fromCol);

    // Mouvement standard du roi
    if (rowDiff <= 1 && colDiff <= 1) {
      return this.isPathClear(to);
    }

    return false;
  }

}