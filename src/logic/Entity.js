
import Pawn from "./Pawn";
import Rook from "./pieces/Rook";
import Knight from "./pieces/Knight";
import Bishop from "./pieces/Bishop";
import Queen from "./pieces/Queen";
import King from "./pieces/King";
import BaseEntity from './BaseEntity';

export default class Entity extends BaseEntity {
  static getColorByEntity(entity) {
    if (!entity) return null;
    return entity === entity.toUpperCase() ? 'white' : 'black';
  }

  static fromChar(c, position, squares, enPassantTarget) {
    const type = c.toLowerCase();
    const color = c === c.toUpperCase() ? 'white' : 'black';

    switch (type) {
      case 'p':
        return new Pawn(
          type, color, position, squares, enPassantTarget);
      case 'r':
        return new Rook(
          type, color, position, squares);
      case 'n':
        return new Knight(
          type, color, position, squares);
      case 'b':
        return new Bishop(
          type, color, position, squares);
      case 'q':
        return new Queen(
          type, color, position, squares);
      case 'k':
        return new King(
          type, color, position, squares);
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
  }
  constructor(type, color, position) {
    this.type = type.toLowerCase();
    this.color = color;
    assets.assert(['white', 'black'].includes(this.color), 'Invalid color');
    this.position = position;
    assets.assert(Number.isInteger(this.position) && this.position >= 0 && this.position < 64, 'Invalid position');
    this.hasMoved = false;

    this.fromRow = Math.floor(this.position / 8);
    this.fromCol = this.position % 8;
  }


}