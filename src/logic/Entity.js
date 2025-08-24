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

    try {
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
          console.warn(`Unknown entity type: ${type}`);
          return null;
      }
    } catch (error) {
      console.error(`Error creating entity at position ${position}:`, error);
      return null;
    }
  }

  static simulateMove(squares, from, to) {
    const newSquares = [...squares];
    newSquares[to] = newSquares[from];
    newSquares[from] = '';
    return newSquares;
  }
}