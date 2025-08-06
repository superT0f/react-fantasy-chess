import { useState } from 'react';
import { Square } from './Square';
import Entity from './logic/Entity';

export function Board({ currentPlayer, squares, onMove, enPassantTarget, lastDoubleStepPawn }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMovedSquare, setLastMovedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [isOpponentPiece, setIsOpponentPiece] = useState(false);

  function handleMouseEnter(i) {
    if (squares[i]) {
      setIsOpponentPiece(Entity.getColorByEntity(squares[i]) !== currentPlayer);
      setValidMoves(getAllValidMoves(i));
    }
  }

  function handleMouseLeave(aSquareIsSelected) {
    if (aSquareIsSelected) return;
    setValidMoves([]);
  }


  function getAllValidMoves(from) {
    const moves = [];
    if (!squares[from]) return moves;

    for (let to = 0; to < 64; to++) {
      if (isValidMove(from, to)) {
        moves.push(to);
      }
    }

    return moves;
  }


  function isValidMove(from, to) {
    if (from === to) return false;

    const entityChar = squares[from];
    const toentity = squares[to];

    if (!entityChar) return false;

    if (toentity && Entity.getColorByEntity(toentity) ===
      Entity.getColorByEntity(entityChar)) {
      return false;
    }

    // Ask entity type obj if the move is valid
    const isValid = (Entity.fromChar(entityChar, from, squares)).isValidMove(to);

    return isValid;
  }


  function handleClick(i) {
    if (selectedSquare !== null) {
      if (isValidMove(selectedSquare, i)) {
        const newSquares = [...squares];
        const entityChar = squares[selectedSquare];
        const entityType = entityChar.toLowerCase();
        const entityColor = Entity.getColorByEntity(entityChar);

        newSquares[i] = entityChar;
        newSquares[selectedSquare] = '';

        let newEnPassantTarget = null;
        let newLastDoubleStepPawn = null;

        let capturedPiece = null;
        let isEnPassant = false;

        if (entityType === 'p' && enPassantTarget !== null
          && i === enPassantTarget) {

          const direction = entityColor === 'white' ? -1 : 1;
          const captureRow = Math.floor(i / 8) - direction;
          const capturedIndex = captureRow * 8 + (i % 8);

          capturedPiece = squares[capturedIndex];
          isEnPassant = true;
        } else if (squares[i] !== '') {
          capturedPiece = squares[i];
        }

        onMove(
          newSquares,
          newEnPassantTarget,
          newLastDoubleStepPawn,
          selectedSquare,
          i,
          capturedPiece,
          isEnPassant
        );
        setLastMovedSquare(i);
      }
      setSelectedSquare(null);
      setValidMoves([]);
    } else if (squares[i] && Entity.getColorByEntity(squares[i]) === currentPlayer) {
      setSelectedSquare(i);
      setValidMoves(getAllValidMoves(i));
    }
  }


  return (
    <>
      {Array(8).fill(null).map((_, row) => (
        <div className="board-row" key={row}>
          {Array(8).fill(null).map((_, col) => {
            const squareIndex = row * 8 + col;
            var isValidMove = validMoves.includes(squareIndex);
            return (
              <Square
                key={squareIndex}
                value={squares[squareIndex]}
                isSelected={selectedSquare === squareIndex}
                isAnimated={lastMovedSquare === squareIndex}
                onSquareClick={() => handleClick(squareIndex)}
                onMouseEnter={() => handleMouseEnter(squareIndex)}
                onMouseLeave={() => handleMouseLeave(selectedSquare !== null)}
                isValidMove={isValidMove}
                isOpponentPiece={isOpponentPiece}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}
