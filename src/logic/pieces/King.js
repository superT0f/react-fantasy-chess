import BaseEntity from '../BaseEntity';
import Entity from '../Entity';
import PgnNotation from '../PgnNotation';
import Log from '../../Log'

export default class King extends BaseEntity {
  isValidMove(to, squares = this.squares) {
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - this.fromRow);
    const colDiff = Math.abs(toCol - this.fromCol);


    const fromXY = PgnNotation.idxToXY(this.position);
    const toXY = PgnNotation.idxToXY(to);

    if (fromXY === 'e8'
      && toXY === 'f7') {
      Log.debug(`king isValidMove : ${fromXY}->${toXY}
        ${rowDiff}|${colDiff}`);
      Log.chessBoardPretty(squares);
    }

    if (rowDiff <= 1 && colDiff <= 1) {

      const tempBoard = this.referee.simulateMove(squares, this.position, to);
      const isPathClear = this.isPathClear(to, squares);
      const isCheckAfter = this.referee.isCheck(tempBoard, this.color);

      if (fromXY === 'e8'
        && toXY === 'f7') {
        Log.debug(`king isValidMove
         isPathClear:${isPathClear}
         isCheckAfter:${isCheckAfter}`);
      }
      return isPathClear && !isCheckAfter;
    }

    if (!this.hasMoved && rowDiff === 0 && colDiff === 2) {
      return this.canCastle(to);
    }

    return false;
  }

  canCastle(to, squares = this.squares) {
    const toCol = to % 8;
    const direction = toCol > this.fromCol ? 1 : -1;
    const rookCol = direction === 1 ? 7 : 0;
    const rookPos = this.fromRow * 8 + rookCol;
    const rook = squares[rookPos];

    // Check if king has moved
    if (this.referee.hasPieceMoved(this.position)) {
      return false;
    }

    // Check if rook has moved
    if (this.referee.hasPieceMoved(rookPos)) {
      return false;
    }

    // Check if the rook is present, of the same color
    if (!rook || rook.toLowerCase() !== 'r' ||
      Entity.getColorByEntity(rook) !== this.color) {
      return false;
    }

    // Check if the path between the king and rook is clear
    const start = Math.min(this.position % 8, rookCol) + 1;
    const end = Math.max(this.position % 8, rookCol);
    for (let col = start; col < end; col++) {
      if (squares[this.fromRow * 8 + col] !== '') {
        return false;
      }
    }

    // Check if king is not in check
    if (this.referee.isCheck(squares, this.color)) {
      return false;
    }

    // Check if king doesn't pass through check
    const kingStep = direction;
    for (let col = this.fromCol + kingStep; col !== toCol; col += kingStep) {
      const tempPos = this.fromRow * 8 + col;
      const tempBoard = this.referee.simulateMove(squares, this.position, tempPos);
      if (this.referee.isCheck(tempBoard, this.color)) {
        return false;
      }
    }

    return true;
  }
}