import { useState } from 'react';
import { Square } from './Square';
import Entity from './logic/Entity';

export function Board({ currentPlayer, squares, onMove, enPassantTarget, lastDoubleStepPawn }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMovedSquare, setLastMovedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  function handleMouseEnter(i) {
    if (squares[i]) {
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

  function isPathClearOld(from, to, pieceType) {
    if (pieceType === 'n') return true;

    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;

    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      const index = currentRow * 8 + currentCol;
      if (squares[index] !== '') return false;

      currentRow += rowStep;
      currentCol += colStep;
    }
    return true;
  }

  function getColor(entity) {
    if (!entity) return null;
    return entity === entity.toUpperCase() ? 'white' : 'black';
  }

  function isValidMove(from, to) {
    if (from === to) return false;
    
    const entityStr = squares[from];    
    if (!entityStr) return false;
    const toentity = squares[to];
    if (toentity && getColor(toentity) === getColor(Entity.fromString(entityStr))) return false;

    return (Entity.fromString(entityStr)).isValidMove(to);
  }


  function handleClick(i) {
    if (selectedSquare !== null) {
      if (isValidMove(selectedSquare, i)) {
        const newSquares = [...squares];
        const piece = squares[selectedSquare];
        const pieceType = piece.toLowerCase();
        const pieceColor = getPieceColor(piece);

        newSquares[i] = piece;
        newSquares[selectedSquare] = '';

        let newEnPassantTarget = null;
        let newLastDoubleStepPawn = null;

        let capturedPiece = null;
        let isEnPassant = false;

        if (pieceType === 'p' && enPassantTarget !== null
          && i === enPassantTarget) {

          const direction = pieceColor === 'white' ? -1 : 1;
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
    } else if (squares[i] && getPieceColor(squares[i]) === currentPlayer) {
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
            const isPlayerPiece = squares[squareIndex] && getPieceColor(squares[squareIndex]) === currentPlayer;
            const isOpponentPiece = !isPlayerPiece;
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
