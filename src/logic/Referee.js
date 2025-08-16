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
    return this.history[this.currentMoveIndex]?.squares;
  }

  getSquare(idx) {
    return this.history[this.currentMoveIndex]?.squares? this.history[this.currentMoveIndex].squares[idx] : null;
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

  getAllValidMoves(from, squares, enPassantTarget) {
    const moves = [];

    if (!this.getCurrentBoard()[from]) return moves;

    for (let to = 0; to < 64; to++) {
      if (this.isValidMove(from, to, squares, enPassantTarget)) {
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

  handleSquareClick(squareIndex, currentState, squares, enPassantTarget) {
    const { selectedSquare, validMoves } = currentState;
    const newState = { ...currentState };

    if (selectedSquare !== null) {
      const entity = this.isValidMove(selectedSquare, squareIndex, squares, enPassantTarget);
      
      if (entity) {
        newState.lastMovedSquare = squareIndex;
        newState.selectedSquare = null;
        newState.validMoves = [];
        
        return {
          newState,
          moveData: {
            from: selectedSquare,
            to: squareIndex,
            entity,
            isEnPassant: entity.isEnPassant(squareIndex)
          }
        };
      } else {
        newState.selectedSquare = null;
        newState.validMoves = [];
      }
    } else if (squares[squareIndex] && 
               Entity.getColorByEntity(squares[squareIndex]) === this.turn) {
      newState.selectedSquare = squareIndex;
      newState.validMoves = this.getAllValidMoves(squareIndex, squares, enPassantTarget);
      newState.isOpponentPiece = false;
    }

    return { newState, moveData: null };
  }

  recordMove(squares, from, to, piece, captured, isEnPassant, isCheck, isCheckmate) {
    const pgn = PgnNotation.getMoveNotation(
      from,
      to,
      piece,
      captured,
      isEnPassant,
      isCheck,
      isCheckmate
    );

    this.history.push({
      squares: [...squares],
      pgn,
      from,
      to,
      piece,
      captured
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
  getCurrentMove() {
    return this.currentMove;
  }

  jumpTo(move) {
    this.currentMove = move;
    return this.history[move]?.squares || null;
  }
}
