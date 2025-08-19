import { useState } from 'react';
import Entity from '../logic/Entity';

export function useBoardState(referee, onMove) {
  const [localState, setLocalState] = useState({
    selectedSquare: null,
    validMoves: [],
    lastMovedSquare: null,
    isOpponentPiece: false,
    enPassantTarget: null
  });

  const handleSquareClick = (squareIndex, gameStatus) => {
    if (gameStatus !== 'playing') return;

    const { newState, moveData } = referee.handleSquareClick(
      squareIndex,
      localState,
      localState.enPassantTarget
    );

    setLocalState(newState);

    if (moveData) {
      const newSquares = [...referee.getCurrentBoard()];
      const captured = newSquares[moveData.to];
      newSquares[moveData.to] = newSquares[moveData.from];
      newSquares[moveData.from] = '';

      if (moveData.isCastle) {
        const direction = moveData.to % 8 > moveData.from % 8 ? 1 : -1;
        const rookFromCol = direction === 1 ? 7 : 0;
        const rookToCol = direction === 1 ? 5 : 3;
        const rookFrom = Math.floor(moveData.from / 8) * 8 + rookFromCol;
        const rookTo = Math.floor(moveData.from / 8) * 8 + rookToCol;

        newSquares[rookTo] = newSquares[rookFrom];
        newSquares[rookFrom] = '';
      }

      onMove(
        newSquares,
        moveData.from,
        moveData.to,
        captured,
        moveData.isEnPassant,
        moveData.isCastle
      );
    }
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