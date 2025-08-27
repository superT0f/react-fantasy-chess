import Entity from './Entity';
import PgnNotation from './PgnNotation';
import MoveData from './MoveData';
import Log from '../Log';

export default class Referee {
  constructor() {
    this.history = [{
      squares: this.getInitialBoard(),
      pgn: 'Start'
    }];
    this.defaultInitialBoard = [
      'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
      'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
      'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
    ];
    this.initialBoard = this.defaultInitialBoard;
    this.currentMoveIndex = 0;
    this.turn = 'white';
    this.player = 'white';
  }

  setInitialBoard(squares) {
    this.initialBoard = squares;
  }
  getInitialBoard() {
    return this.initialBoard;
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
    let color = null;
    if (entityChar) {
      color = (entityChar.toUpperCase() === entityChar) ? 'white' : 'black';
    }
    return color;
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

  isValidMove(from, to, squares = this.getCurrentBoard(), enPassantTarget = '') {
    if (from === to) return false;
    const entityChar = squares[from];
    const toEntity = squares[to];

    if (!entityChar) return false;
    const colorFrom = Entity.getColorByEntity(entityChar);

    if (toEntity && colorFrom === Entity.getColorByEntity(toEntity)) {
      return false;
    }

    const entity = Entity.fromChar(this, from);
    if (!entity) return false;

    if (entity.isValidMove(to, squares)) {
      const isCastle = entity.type === 'k' && Math.abs(to % 8 - from % 8) === 2;
      const isEnPassant = entity && entity.isEnPassant(to);
      const simulatedBoard = this.simulateMove(
        squares,
        from,
        to,
        isCastle,
        isEnPassant
      );
      const isCheck = this.isCheck(simulatedBoard, this.turn);
      return !isCheck;
    }

    return false;
  }

  getAllValidMoves(from, squares = this.getCurrentBoard(), enPassantTarget = '') {
    const moves = [];

    if (!squares || !squares[from]) return moves;
    const color = (squares[from] === squares[from].toUpperCase()) ? 'white' : 'black';
    for (let to = 0; to < 64; to++) {
      if (this.isValidMove(from, to, squares, enPassantTarget)) {
        const tempBoard = this.simulateMove(squares, from, to);
        const isCheckAfter = this.isCheck(tempBoard, color);
        if (!isCheckAfter) {
          moves.push(to);
        }
      }
    }

    return moves;
  }

  getAllValidMovesForPlayer(player, squares = this.getCurrentBoard(),
    enPassantTarget = null, scoreMoves = false, moveQualityEstimator = null) {
    const moves = [];

    for (let from = 0; from < 64; from++) {
      const entityChar = squares[from];
      if (entityChar && this.getSquareColor(from) === player) {
        const validTargets = this.getAllValidMoves(from, squares, enPassantTarget);

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
        const entityCopy = Entity.fromChar(this, from);
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

  simulateMove(squares, from, to, isCastle = false, isEnPassant = false) {
    const newSquares = [...squares];
    Log.debug(`simulateMove ${PgnNotation.idxToXY(from)}`)
    if (isCastle) {
      const direction = to % 8 > from % 8 ? 1 : -1;
      const rookFromCol = direction === 1 ? 7 : 0;
      const rookToCol = direction === 1 ? 5 : 3;
      const rookFrom = Math.floor(from / 8) * 8 + rookFromCol;
      const rookTo = Math.floor(from / 8) * 8 + rookToCol;

      // Move the king
      newSquares[to] = newSquares[from];
      newSquares[from] = '';

      // Move the rook
      newSquares[rookTo] = newSquares[rookFrom];
      newSquares[rookFrom] = '';

      return newSquares;
    }
    else if (isEnPassant) {
      const entityChar = newSquares[from];
      const color = Entity.getColorByEntity(entityChar);
      const direction = color === 'white' ? -1 : 1;
      const targetPawn = to + 8 * direction;

      // Move the pawn
      newSquares[to] = newSquares[from];
      newSquares[from] = '';

      // Remove the captured pawn
      newSquares[targetPawn] = '';

      return newSquares;
    } else {
      // Regular move
      newSquares[to] = newSquares[from];
      newSquares[from] = '';
    }

    return newSquares;
  }

  handleSquareClick(squareIndex, currentState) {
    const { selectedSquare, validMoves } = currentState;
    const newState = { ...currentState };
    let isCastle = false;
    let isEnPassant = false;
    // click on previous : unselect
    if (selectedSquare && selectedSquare === squareIndex) {
      newState.selectedSquare = null;
      newState.validMoves = [];
    }
    //a previous square is selected
    else if (selectedSquare !== null) {
      if (this.isValidMove(
        selectedSquare,
        squareIndex,
        this.getCurrentBoard(),
        currentState.enPassantTarget)) {
        const entity = Entity.fromChar(this, selectedSquare);
        newState.lastMovedSquare = squareIndex;
        newState.selectedSquare = null;
        newState.validMoves = [];

        isCastle = entity.type === 'k' && Math.abs(selectedSquare % 8 - squareIndex % 8) === 2;
        isEnPassant = entity && entity.isEnPassant(squareIndex);

        return {
          newState,
          moveData: {
            from: selectedSquare,
            to: squareIndex,
            entity,
            isEnPassant: isEnPassant,
            isCastle,
          }
        };
      } else {
        newState.selectedSquare = squareIndex;
        newState.validMoves = [];
      }
    }
    else if (this.getSquareColor(squareIndex) === this.turn) {
      newState.selectedSquare = squareIndex;
      newState.validMoves = this.getAllValidMoves(
        squareIndex, this.getCurrentBoard(),
        currentState.enPassantTarget);
      newState.isOpponentPiece = false;
    }
    else {
      console.warn('Invalid square click:', PgnNotation.idxToXY(squareIndex), ' Selected:', selectedSquare);
    }

    return { newState, moveData: null };
  }

  recordMove(moveData) {
    let newSquares = [...moveData.squares];
    const promotionPiece = (this.turn === 'white') ? moveData.promotionPiece?.toUpperCase() : moveData.promotionPiece?.toLowerCase();
    // the enPassant take the opponent pawn
    if (moveData.isEnPassant) {
      const direction = (this.turn === 'white') ? -1 : 1;
      const targetPawn = moveData.to + 8 * direction;
      newSquares[targetPawn] = '';
    }

    if (moveData.isPromotion && moveData.promotionPiece) {
      Log.debug(`record promotion ${promotionPiece}`);
      newSquares[moveData.to] = promotionPiece;
      newSquares[moveData.from] = '';
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
      moveData.isCastle,
      moveData.isPromotion,
      moveData.promotionPiece
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
    this.player = this.turn = this.player === 'white' ? 'black' : 'white';
    Log.debug(`recordMove end: 
      from : ${PgnNotation.idxToXY(moveData.from)}
     -> to : ${PgnNotation.idxToXY(moveData.to)}`);
    Log.debug(moveData);
    // Log.chessBoardPretty(newSquares);
  }

  // Add to the Referee class
  isPromotionMove(from, to) {
    const entityChar = this.getSquare(from);
    if (!entityChar || entityChar.toLowerCase() !== 'p') return false;

    const entity = Entity.fromChar(this, from);
    return entity.isPromotionMove(to);
  }

  promotePawn(square, promotedPiece) {
    const squares = [...this.getCurrentBoard()];
    const color = this.getSquareColor(square);

    squares[square] = promotedPiece;

    // Update history with promoted piece
    this.history[this.currentMoveIndex].squares = squares;
    return squares;
  }
  getHistory() {
    return this.history;
  }

  getTurn() {
    return this.turn;
  }
  getCurrentPlayer() {
    return this.player;
  }

  getCurrentOpponent() {
    return this.player === 'white' ? 'black' : 'white';
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

  isCheck(squares, player) {
    const kingChar = player === 'white' ? 'K' : 'k';
    const kingPosition = squares.indexOf(kingChar);

    if (kingPosition === -1) {
      Log.debug(`isCheck ${player} king(${kingChar}) not found`);

      return false; // should not happen, but just in case
    }

    // verify if any opponent can attack the king
    for (let i = 0; i < 64; i++) {
      const piece = squares[i];
      if (piece && Entity.getColorByEntity(piece) !== player) {
        if (this.isValidMove(i, kingPosition, squares)) {
          return true;
        }
      }
    }
    return false;
  }

  isCheckmate(squares, player) {
    if (!this.isCheck(squares, player)) {
      return false;
    }
    const moves = this.getAllValidMovesForPlayer(player, squares);
    return (moves && moves.length === 0);
  }

  simulateMove(squares, from, to, isCastle = false, isEnPassant = false) {
    const newSquares = [...squares];

    // Handle castling
    if (isCastle) {
      const direction = to % 8 > from % 8 ? 1 : -1;
      const rookFromCol = direction === 1 ? 7 : 0;
      const rookToCol = direction === 1 ? 5 : 3;
      const rookFrom = Math.floor(from / 8) * 8 + rookFromCol;
      const rookTo = Math.floor(from / 8) * 8 + rookToCol;

      // Move the king
      newSquares[to] = newSquares[from];
      newSquares[from] = '';

      // Move the rook
      newSquares[rookTo] = newSquares[rookFrom];
      newSquares[rookFrom] = '';

      return newSquares;
    }

    // Handle en passant
    if (isEnPassant) {
      const entityChar = newSquares[from];
      const color = Entity.getColorByEntity(entityChar);
      const direction = color === 'white' ? -1 : 1;
      const targetPawn = to + 8 * direction;

      // Move the pawn
      newSquares[to] = newSquares[from];
      newSquares[from] = '';

      // Remove the captured pawn
      newSquares[targetPawn] = '';

      return newSquares;
    }

    // Regular move
    newSquares[to] = newSquares[from];
    newSquares[from] = '';
    return newSquares;
  }
  isStalemate(squares, player) {
    // If player is in check, it's not stalemate
    if (this.isCheck(squares, player)) {
      return false;
    }
    const moves = this.getAllValidMovesForPlayer(player, squares);

    return (moves && moves.length === 0);
  }
}
