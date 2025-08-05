import Entity from './Entity';

export class Knight extends Entity {
  isValidMove(to) {
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }
}