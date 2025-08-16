import { useState } from 'react';
import { Square } from './Square';
import { PgnNotation } from './logic';
import Entity from './logic/Entity';

export function Board({ onMove, gameStatus, lastMove, referee }) {
  const [localState, setLocalState] = useState({
    selectedSquare: null,
    validMoves: [],
    lastMovedSquare: null,
    isOpponentPiece: false,
    enPassantTarget: null
  });
  const squares = referee.getCurrentBoard();
  const currentPlayer = referee.getCurrentPlayer();
  

    const handleClick = (squareIndex) => {
    if (gameStatus !== 'playing') return;

    const { newState, moveData } = referee.handleSquareClick(
      squareIndex,
      localState,
      squares,
      localState.enPassantTarget
    );

    setLocalState(newState);

    if (moveData) {
      const newSquares = [...squares];
      const captured = newSquares[moveData.to];
      newSquares[moveData.to] = newSquares[moveData.from];
      newSquares[moveData.from] = '';

      onMove(
        newSquares,
        moveData.from,
        moveData.to,
        captured,
        moveData.isEnPassant
      );
    }
  };
  
  const [lastMovedSquare, setLastMovedSquare] = useState(null);
  
  
  function handleMouseEnter(i) {
    if (gameStatus !== 'playing') return;
    if (squares[i] && !localState.selectedSquare) {
      setLocalState(prev => ({
        ...prev,
        isOpponentPiece: Entity.getColorByEntity(squares[i]) !== currentPlayer,
        validMoves: referee.getAllValidMoves(i, squares, currentPlayer, localState.enPassantTarget)
      }));
    }
  }

  function handleMouseLeave() {
    if (localState.selectedSquare) return;
    setLocalState(prev => ({ ...prev, validMoves: [] }));
  }

  return (
    <>
      {Array(8).fill(null).map((_, row) => (
        <div className="board-row" key={row}>
          {Array(8).fill(null).map((_, col) => {
            const squareIndex = row * 8 + col;
            var isValidMove =  localState.validMoves.includes(squareIndex);
            const entityChar =  referee.getSquare(squareIndex);
            const isKingInCheck = entityChar && entityChar.toLowerCase() === 'k' &&
              Entity.isCheck(referee.getCurrentBoard(), currentPlayer) &&
              Entity.getColorByEntity(entityChar) === currentPlayer;

            const isLastMoveFrom = lastMove?.from === PgnNotation.idxToXY(squareIndex);
            const isLastMoveTo = lastMove?.to === PgnNotation.idxToXY(squareIndex);

            return (
              <Square
                key={squareIndex}
                squareIndex={squareIndex}
                value={entityChar}
                onSquareClick={() => handleClick(squareIndex)}
                onMouseEnter={() => handleMouseEnter(squareIndex)}
                onMouseLeave={() => handleMouseLeave(localState.selectedSquare !== null)}
                isSelected={localState.selectedSquare === squareIndex}
                isValidMove={isValidMove}
                isKingInCheck={isKingInCheck}
                isAnimated={lastMovedSquare === squareIndex}
                isOpponentPiece={localState.isOpponentPiece}
                isLastMoveFrom={isLastMoveFrom}
                isLastMoveTo={isLastMoveTo}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}
