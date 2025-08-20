import Entity from './Entity';
import PgnNotation from './PgnNotation';
import Utils from '../Utils';
import MoveData from './MoveData';

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
      if (this.isValidMove(from, to, enPassantTarget)) {
        moves.push(to);
      }
    }

    return moves;
  }

  getAllValidMovesForPlayer(player, enPassantTarget = null, scoreMoves = false, moveQualityEstimator = null) {
    const moves = [];
    const squares = this.getCurrentBoard();

    for (let from = 0; from < 64; from++) {
      const entityChar = squares[from];
      if (entityChar && this.getSquareColor(from) === player) {
        const validTargets = this.getAllValidMoves(from, enPassantTarget);

        validTargets.forEach(to => {
          const move = {
            from,
            to,
            entity: entityChar
          };

          if (scoreMoves && moveQualityEstimator) {
            move.score = moveQualityEstimator(from, to, squares);
          }

          moves.push(move);
        });
      }
    }

    return scoreMoves ? moves.sort((a, b) => (b.score || 0) - (a.score || 0)) : moves;
  }


  getValidMovesForPiece(entity, from, squares, enPassantTarget = null) {
    const validMoves = [];

    // Check all 64 squares for valid moves
    for (let to = 0; to < 64; to++) {
      if (from === to) continue;

      try {
        // Create a new entity instance for each position check
        const entityCopy = Entity.fromChar(
          entity.getSymbol(),
          from,
          squares,
          enPassantTarget
        );

        if (entityCopy.isValidMove(to)) {
          // Additional safety check - make sure the move doesn't leave king in check
          const simulatedBoard = Entity.simulateMove(squares, from, to);
          const playerColor = Entity.getColorByEntity(entity.getSymbol());

          if (!Entity.isCheck(simulatedBoard, playerColor)) {
            validMoves.push(to);
          }
        }
      } catch (error) {
        console.warn(`Error checking move ${from}->${to}:`, error);
      }
    }

    return validMoves;
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
    let isCastle = false;

    if (selectedSquare !== null) {
      const entity = this.isValidMove(
        selectedSquare,
        squareIndex,
        currentState.enPassantTarget);

      if (entity) {
        newState.lastMovedSquare = squareIndex;
        newState.selectedSquare = null;
        newState.validMoves = [];

        isCastle = entity.type === 'k' && Math.abs(selectedSquare % 8 - squareIndex % 8) === 2;


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
        newState.selectedSquare = squareIndex;
        newState.validMoves = [];
      }
    } else if (this.getSquareColor(squareIndex) === this.turn) {
      newState.selectedSquare = squareIndex;
      newState.validMoves = this.getAllValidMoves(squareIndex, currentState.enPassantTarget);
      newState.isOpponentPiece = false;
    } else {
      console.warn('Invalid square click:', squareIndex, 'Selected:', selectedSquare);
    }

    return { newState, moveData: null };
  }

  recordMove(moveData) {
    let newSquares = [...moveData.squares];

    if (moveData.isCastle) {
      const direction = moveData.to % 8 > moveData.from % 8 ? 1 : -1;
      const rookFromCol = direction === 1 ? 7 : 0;
      const rookToCol = direction === 1 ? 5 : 3;
      const rookFrom = Math.floor(moveData.from / 8) * 8 + rookFromCol;
      const rookTo = Math.floor(moveData.from / 8) * 8 + rookToCol;

      newSquares[rookTo] = newSquares[rookFrom];
      newSquares[rookFrom] = '';
    }

    const entityChar = this.getSquare(moveData.from);
    const pgn = PgnNotation.getMoveNotation(
      moveData.from,
      moveData.to,
      entityChar,
      moveData.captured,
      moveData.isEnPassant,
      moveData.isCheck,
      moveData.isCheckmate,
      moveData.isCastle
    );

    this.history.push({
      squares: newSquares,
      pgn,
      from: moveData.from,
      to: moveData.to,
      entityChar,
      captured: moveData.captured,
      isCastle: moveData.isCastle
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

  getOpponent(player) {
    return player === 'white' ? 'black' : 'white';
  }
  
  getCurrentMove() {
    return this.currentMove;
  }

  jumpTo(move) {
    this.currentMove = move;
    return this.history[move]?.squares || null;
  }
}
