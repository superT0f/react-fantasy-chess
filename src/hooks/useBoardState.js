import { useState } from 'react';
import Entity from '../logic/Entity';
import MoveData from '../logic/MoveData';
import Log from '../Log';

export function useBoardState(referee, onMove, onPromotion) {
  const [localState, setLocalState] = useState({
    selectedSquare: null,
    validMoves: [],
    lastMovedSquare: null,
    isOpponentPiece: false,
    enPassantTarget: null,
    promotionSquare: null // Add promotion state
  });

const handleSquareClick = (squareIndex, gameStatus) => {
  if (gameStatus !== 'playing') {
    Log.debug('Game not in playing state, ignoring click');
    return;
  }

  // Check if we're in promotion selection mode
  if (localState.promotionSquare !== null) {
    Log.debug('promotion detected');
    handlePromotionSelection(moveData.from, moveData.to, squareIndex);
    return;
  }

  const { newState, moveData } = referee.handleSquareClick(
    squareIndex,
    localState
  );

  setLocalState(newState);

  if (moveData) {
    // Only show promotion modal for human players, not AI
    const isHumanPlayer = referee.getCurrentPlayer() === 'white' || gameMode !== 'ai';
    
    if (referee.isPromotionMove(moveData.from, moveData.to) && isHumanPlayer) {
      onPromotion(moveData.from, moveData.to);
      // we cant process this move yet : need user choice
      return;
    }

    // Process regular move (including AI promotion which auto-promotes to queen)
    processMove(moveData);
  } else {
    Log.debug(`No valid move from square: ${squareIndex}`);
  }
};

  const handlePromotionSelection = (from, to, pieceSelection) => {
    const promotionPieces = ['q', 'r', 'b', 'n'];
    
    if (promotionPieces.includes(pieceSelection)) {

      const promotedSquares = referee.promotePawn(localState.promotionSquare, pieceSelection);
      
      const moveData = new MoveData({
        from: from,
        to: to,
        squares: promotedSquares,
        isPromotion: true,
        promotionPiece: pieceSelection,
        isFromIA: false
      });

      onMove(moveData);
      
      setLocalState(prev => ({
        ...prev,
        promotionSquare: null
      }));
    }
  };

  const processMove = (moveData) => {
    const newSquares = [...referee.getCurrentBoard()];
    const captured = newSquares[moveData.to];
    if (moveData.isCastle) {
      const direction = moveData.to % 8 > moveData.from % 8 ? 1 : -1;
      const rookFromCol = direction === 1 ? 7 : 0;
      const rookToCol = direction === 1 ? 5 : 3;
      const rookFrom = Math.floor(moveData.from / 8) * 8 + rookFromCol;
      const rookTo = Math.floor(moveData.from / 8) * 8 + rookToCol;
      
      newSquares[moveData.to] = newSquares[moveData.from];
      newSquares[rookTo] = referee.getSquare(rookFrom);
      newSquares[moveData.from] = '';
      newSquares[rookFrom] = '';
    } else {
      newSquares[moveData.to] = newSquares[moveData.from];
      newSquares[moveData.from] = '';
    }

    const moveDataObj = new MoveData({
      from: moveData.from,
      to: moveData.to,
      squares: newSquares,
      captured,
      isEnPassant: moveData.isEnPassant,
      isCheck: Entity.isCheck(newSquares, referee.getCurrentPlayer()),
      isCheckmate: Entity.isCheckmate(newSquares, referee.getCurrentOpponent()),
      isCastle: moveData.isCastle,
      isFromIA: false
    });

    onMove(moveDataObj);
  };

  const handleMouseEnter = (squareIndex, gameStatus, squares, currentPlayer) => {
    if (gameStatus !== 'playing') return;
    if (squares[squareIndex] && !localState.selectedSquare) {
      setLocalState(prev => ({
        ...prev,
        isOpponentPiece: Entity.getColorByEntity(squares[squareIndex]) !== currentPlayer,
        validMoves: referee.getAllValidMoves(squareIndex, squares, currentPlayer, localState.enPassantTarget)
      }));
    }
  };

  const handleMouseLeave = () => {
    if (localState.selectedSquare) return;
    setLocalState(prev => ({ ...prev, validMoves: [] }));
  };

  return { localState, handleSquareClick, handleMouseEnter, handleMouseLeave };
}