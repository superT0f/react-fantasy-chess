import Pawn from "./Pawn";
import Rook from "./pieces/Rook";
import Knight from "./pieces/Knight";
import Bishop from "./pieces/Bishop";
import Queen from "./pieces/Queen";
import King from "./pieces/King";
import BaseEntity from './BaseEntity';
import PgnNotation from "./PgnNotation";
import Log from "../Log";

export default class Entity extends BaseEntity {
  constructor(referee, position) {
    super(referee, position);




    // console.log(`entity : ${this.position} - ${this.type} - ${this.color}`);
    assets.assert(['white', 'black'].includes(this.color), 'Invalid color');
    assets.assert(
      Number.isInteger(this.position)
      && this.position >= 0
      && this.position < 64, 'Invalid position');
  }

  static getColorByEntity(entity) {
    if (!entity) return null;
    return entity === entity.toUpperCase() ? 'white' : 'black';
  }

  static fromChar(referee, position) {
    if (!referee) return null;
    const entityChar = referee.getSquare(position);
    if (!entityChar) return null;

    const type = entityChar.toLowerCase();

    switch (type) {
      case 'p':
        return new Pawn(referee, position);
      case 'r':
        return new Rook(referee, position);
      case 'n':
        return new Knight(referee, position);
      case 'b':
        return new Bishop(referee, position);
      case 'q':
        return new Queen(referee, position);
      case 'k':
        return new King(referee, position);
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
  }

  static isCheck(squares, player) {
    const kingChar = player === 'white' ? 'K' : 'k';
    const kingPosition = squares.indexOf(kingChar);

    if (kingPosition === -1) {
      Log.debug(`isCheck king(${kingChar}) not found`);
      return false; // should not happen, but just in case
    }

    // verify if any opponent can attack the king
    for (let i = 0; i < 64; i++) {
      const piece = squares[i];
      if (piece && Entity.getColorByEntity(piece) !== player) {
        const entity = Entity.fromChar(this.referee, i);

        if (entity) {
          entity.squares = squares;
          if (entity.isValidMove(kingPosition)) {
            Log.debug(`${entity} can move to ${kingPosition}`);
            return true;
          }
        }
      }
    }
    return false;
  }

  static isCheckmate(squares, player) {
    if (!this.isCheck(squares, player)) return false;

    // check is there any legal move?
    for (let from = 0; from < 64; from++) {
      if (this.referee.getSquareColor(from) === player) {
        const entity = this.fromChar(this.referee, from);

        for (let to = 0; to < 64; to++) {
          if (entity.isValidMove(to)) {
            const simulatedBoard = this.simulateMove(squares, from, to);
            if (!this.isCheck(simulatedBoard, player)) {
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