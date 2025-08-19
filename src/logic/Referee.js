import Entity from './Entity';
import PgnNotation from './PgnNotation';
import Utils from '../Utils';

export default class Referee {
  constructor() {
    this.history = [{
      squares: this.getInitialBoard(),
      pgn: 'Start'
    }];
    this.currentMoveIndex = 0;
    this.turn = 'white';
  }

  getInitialBoard() {
    return [
      'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
      'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
      'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
    ];
  }

  reset() {
    this.history = [{
      squares: this.getInitialBoard(),
      pgn: 'Start'
    }];
    this.currentMoveIndex = 0;
  }

  getCurrentBoard() {
    return this.history[this.currentMoveIndex]?.squares || this.getInitialBoard();
  }

  getSquare(idx) {
    return this.getCurrentBoard()[idx] || '';
  }
  getSquareLower(idx) {
    const entityChar = this.getSquare(idx);
    return entityChar ? entityChar.toLowerCase() : '';
  }

  getSquareColor(idx) {
    const entityChar = this.getSquare(idx);
    return entityChar ? Entity.getColorByEntity(entityChar) : null;
  }


  getLastMove() {
    return this.history[this.currentMoveIndex];
  }

  getHistory() {
    return this.history;
  }

  getCurrentMoveIndex() {
    return this.currentMoveIndex;
  }

  jumpTo(moveIndex) {
    if (moveIndex >= 0 && moveIndex < this.history.length) {
      this.currentMoveIndex = moveIndex;
      return this.history[moveIndex].squares;
    }
    return null;
  }

  isValidMove(from, to, enPassantTarget) {
    if (from === to) return false;
    const squares = this.getCurrentBoard();
    const entityChar = squares[from];
    const toEntity = squares[to];

    if (!entityChar) return false;

    if (toEntity && Entity.getColorByEntity(toEntity) === Entity.getColorByEntity(entityChar)) {
      return false;
    }

    const entity = Entity.fromChar(entityChar, from, this.getCurrentBoard(), enPassantTarget);
    if (!entity) return false;

    if (entity.isValidMove(to)) {
      const simulatedBoard = this.simulateMove(this.getCurrentBoard(), from, to);
      return !Entity.isCheck(simulatedBoard, this.turn) ? entity : false;
    }

    return false;
  }

  getAllValidMoves(from, enPassantTarget) {
    const moves = [];

    if (!this.getCurrentBoard()[from]) return moves;

    for (let to = 0; to < 64; to++) {
      if (this.isValidMove(from, to, this.getCurrentBoard(), enPassantTarget)) {
        moves.push(to);
      }
    }

    return moves;
  }

  simulateMove(squares, from, to) {
    const newSquares = [...squares];
    newSquares[to] = newSquares[from];
    newSquares[from] = '';
    return newSquares;
  }

  handleSquareClick(squareIndex, currentState) {
    const { selectedSquare, validMoves } = currentState;
    const newState = { ...currentState };

    if (selectedSquare !== null) {
      const entity = this.isValidMove(selectedSquare, squareIndex, this.getCurrentBoard(), currentState.enPassantTarget);

      if (entity) {
        newState.lastMovedSquare = squareIndex;
        newState.selectedSquare = null;
        newState.validMoves = [];


        const isCastle = entity.type === 'k' && Math.abs(selectedSquare % 8 - squareIndex % 8) === 2;


        return {
          newState,
          moveData: {
            from: selectedSquare,
            to: squareIndex,
            entity,
            isEnPassant: entity.isEnPassant(squareIndex),
            isCastle,
          }
        };
      } else {
        newState.selectedSquare = null;
        newState.validMoves = [];
      }
    } else if (this.getSquareColor(squareIndex) === this.turn) {
      newState.selectedSquare = squareIndex;
      newState.validMoves = this.getAllValidMoves(squareIndex, currentState.enPassantTarget);
      newState.isOpponentPiece = false;
    }

    return { newState, moveData: null };
  }

  recordMove(squares, from, to, captured, isEnPassant, isCheck, isCheckmate) {
    let newSquares = [...squares];
    const isCastle = this.getSquareLower(from) === 'k' && Math.abs(from % 8 - to % 8) === 2;

    if (isCastle) {
      const direction = to % 8 > from % 8 ? 1 : -1;
      const rookFromCol = direction === 1 ? 7 : 0;
      const rookToCol = direction === 1 ? 5 : 3;
      const rookFrom = Math.floor(from / 8) * 8 + rookFromCol;
      const rookTo = Math.floor(from / 8) * 8 + rookToCol;

      newSquares[rookTo] = newSquares[rookFrom];
      newSquares[rookFrom] = '';
    }
    const entityChar = this.getSquare(from);
    const pgn = PgnNotation.getMoveNotation(
      from,
      to,
      entityChar,
      captured,
      isEnPassant,
      isCheck,
      isCheckmate,
      isCastle
    );

    this.history.push({
      squares: newSquares,
      pgn,
      from,
      to,
      entityChar,
      captured,
      isCastle
    });
    this.currentMoveIndex++;
    this.turn = this.turn === 'white' ? 'black' : 'white';
  }

  getHistory() {
    return this.history;
  }

  getTurn() {
    return this.turn;
  }
  getCurrentPlayer() {
    return this.turn;
  }

  getCurrentOpponent() {
    return this.turn === 'white' ? 'black' : 'white';
  }
  getCurrentMove() {
    return this.currentMove;
  }

  jumpTo(move) {
    this.currentMove = move;
    return this.history[move]?.squares || null;
  }
}
