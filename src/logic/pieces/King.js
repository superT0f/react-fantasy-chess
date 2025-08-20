import BaseEntity from '../BaseEntity';
import Entity from '../Entity';

export default class King extends BaseEntity {
  isValidMove(to) {
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - this.fromRow);
    const colDiff = Math.abs(toCol - this.fromCol);

    if (rowDiff <= 1 && colDiff <= 1) {
      return this.isPathClear(to);
    }

    if (!this.hasMoved && rowDiff === 0 && colDiff === 2) {
      return this.canCastle(to);
    }

    return false;
  }

  canCastle(to) {
    const toCol = to % 8;
    const direction = toCol > this.fromCol ? 1 : -1; // 1 => O-O, -1 => O-O-O
    const rookCol = direction === 1 ? 7 : 0;
    const rookPos = this.fromRow * 8 + rookCol;
    const rook = this.squares[rookPos];

    // Check if the rook is present, of the same color, and has not moved
    if (!rook || rook.toLowerCase() !== 'r' || 
        Entity.getColorByEntity(rook) !== this.color) {
      return false;
    }

    // Check if the path between the king and rook is clear
    const start = Math.min(this.position % 8, rookCol) + 1;
    const end = Math.max(this.position % 8, rookCol);
    for (let col = start; col < end; col++) {
      if (this.squares[this.fromRow * 8 + col] !== '') {
        return false;
      }
    }

    // Check if the king is not in check, and will not pass through or end up in check
    for (let col = this.fromCol; col !== toCol; col += direction) {
      const tempPos = this.fromRow * 8 + col;
      const tempBoard = Entity.simulateMove(this.squares, this.position, tempPos);
      if (Entity.isCheck(tempBoard, this.color)) {
        return false;
      }
    }

    return true;
  }
}