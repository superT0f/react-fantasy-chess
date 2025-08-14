
import Pawn from "./Pawn";
import Rook from "./pieces/Rook";
import Knight from "./pieces/Knight";
import Bishop from "./pieces/Bishop";
import Queen from "./pieces/Queen";
import King from "./pieces/King";
import BaseEntity from './BaseEntity';
import PgnNotation from "./PgnNotation";

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

  static isCheck(squares, player) {
    const kingChar = player === 'white' ? 'K' : 'k';
    const kingPosition = squares.indexOf(kingChar);

    if (kingPosition === -1) return false; // should not happen, but just in case

    // verify if any opponent can attack the king
    for (let i = 0; i < 64; i++) {
      const piece = squares[i];
      if (piece && Entity.getColorByEntity(piece) !== player) {
        const entity = Entity.fromChar(piece, i, squares);
        if (entity && entity.isValidMove(kingPosition)) {
          return true;
        }
      }
    }
    return false;
  }
  static isStalemate(squares, player) {
    if (Entity.isCheck(squares, player)) return false;

    for (let from = 0; from < 64; from++) {
      const piece = squares[from];
      if (piece && Entity.getColorByEntity(piece) === player) {
        const entity = Entity.fromChar(piece, from, squares);
        for (let to = 0; to < 64; to++) {
          if (entity.isValidMove(to)) {
            const simulatedBoard = Entity.simulateMove(squares, from, to);
            if (!Entity.isCheck(simulatedBoard, player)) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }
  static isCheckmate(squares, player) {
    if (!this.isCheck(squares, player)) return false;

    // check but is there any legal move?
    for (let from = 0; from < 64; from++) {
      const piece = squares[from];
      if (piece && this.getColorByEntity(piece) === player) {
        const entity = this.fromChar(piece, from, squares);

        for (let to = 0; to < 64; to++) {
          if (entity.isValidMove(to)) {
            const simulatedBoard = this.simulateMove(squares, from, to);
            if (!this.isCheck(simulatedBoard, player)) {
              console.log(`Legal move found for ${player} from ${PgnNotation.idxToXY(from)} to ${PgnNotation.idxToXY(to)}`);
              console.log('Simulated board:', simulatedBoard);
              console.log('Current squares:', squares);
              return false; // at least one legal move found
            }
          }
        }
      }
    }

    return true;
  }

  static simulateMove(squares, from, to) {
    const newSquares = [...squares];
    newSquares[to] = newSquares[from];
    newSquares[from] = '';
    return newSquares;
  }
}