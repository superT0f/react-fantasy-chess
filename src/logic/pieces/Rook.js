import Entity from './Entity';

export class Rook extends Entity {
  isValidMove(to) {
  
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;

    return this.isPathClear(to) &&
          (fromRow === toRow || fromCol === toCol);
  }
}