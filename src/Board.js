import { useState } from 'react';
import { Square } from './Square';
import Entity from './logic/Entity';
import PgnNotation from './logic/PgnNotation';

export function Board({ currentPlayer, squares, onMove , lastMove }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMovedSquare, setLastMovedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [isOpponentPiece, setIsOpponentPiece] = useState(false);
  // to track en passant target square from previous move
  const [enPassantTarget, setEnPassantTarget] = useState(null);

  function handleMouseEnter(i) {
    if (squares[i] && !selectedSquare) {
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

  // Check if the move is valid
  // ! and return the entity if valid, or else false
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
    const entity = Entity.fromChar(entityChar, from, squares, enPassantTarget)
    if (!entity) {
      console.error(`Entity not found for char: ${entityChar}`);
      return false;
    }
    if (entity.isValidMove(to)) {
      // Simulate the move to check if it puts the king in check
      const simulatedBoard = simulateMove(squares, from, to);
      if (Entity.isCheck(simulatedBoard, currentPlayer)) {
        return false;
      }
      return entity;

    } else {
      return false;
    }
  }

  function simulateMove(squares, from, to) {
    const newSquares = [...squares];
    newSquares[to] = newSquares[from];
    newSquares[from] = '';
    return newSquares;
  }

  function handleClick(clickedSquareIndex) {
    if (selectedSquare !== null) {
      var entity = isValidMove(selectedSquare, clickedSquareIndex);
      if (entity) {
        const newSquares = [...squares];
        const entityChar = squares[selectedSquare];
        const entityType = entityChar.toLowerCase();
        const entityColor = Entity.getColorByEntity(entityChar);
        let capturedPiece = null;

        // Move the entity : default behavior
        newSquares[clickedSquareIndex] = entityChar;
        newSquares[selectedSquare] = '';

        // Handle special cases for Pawn
        if (entityType === 'p') {
          const direction = entityColor === 'white' ? 1 : -1;
          var enPassantTarget = clickedSquareIndex + 8 * direction;
          let capturedIndex = enPassantTarget - (8 * direction);

          if (entity.isDoubleStep(clickedSquareIndex)) {
            // double step : save en passant target for next move
            setEnPassantTarget(enPassantTarget);
          }
          else {
            // reset en passant target
            setEnPassantTarget(null);
          }
          if (entity.isEnPassant(clickedSquareIndex)) {
            // we take the pawn up one raw
            capturedIndex = clickedSquareIndex + 8 * direction;
            capturedPiece = squares[capturedIndex];
            newSquares[capturedIndex] = '';
          } else {
            if (squares[clickedSquareIndex] !== '')
              capturedPiece = squares[clickedSquareIndex];
          }

        } else if (squares[clickedSquareIndex] !== '') {
          // capture an entity : default behavior
          capturedPiece = squares[clickedSquareIndex];
          setEnPassantTarget(null);
        }


        onMove(
          newSquares,
          selectedSquare,
          clickedSquareIndex,
          capturedPiece,
          entity && entity.isEnPassant(clickedSquareIndex)
        );
        setLastMovedSquare(clickedSquareIndex);
      }
      setSelectedSquare(null);
      setValidMoves([]);
    } else if (squares[clickedSquareIndex] &&
      Entity.getColorByEntity(squares[clickedSquareIndex]) === currentPlayer) {
      setSelectedSquare(clickedSquareIndex);
      setValidMoves(getAllValidMoves(clickedSquareIndex));
    }
  }


  return (
    <>
      {Array(8).fill(null).map((_, row) => (
        <div className="board-row" key={row}>
          {Array(8).fill(null).map((_, col) => {
            const squareIndex = row * 8 + col;
            var isValidMove = validMoves.includes(squareIndex);
            const entityChar = squares[squareIndex];
            const isKingInCheck = entityChar && entityChar.toLowerCase() === 'k' &&
              Entity.isCheck(squares, currentPlayer) &&
              Entity.getColorByEntity(entityChar) === currentPlayer;

            const isLastMoveFrom = lastMove?.from === PgnNotation.idxToXY(squareIndex);
            const isLastMoveTo = lastMove?.to === PgnNotation.idxToXY(squareIndex);

            return (
              <Square
                key={squareIndex}
                squareIndex={squareIndex}
                value={squares[squareIndex]}
                onSquareClick={() => handleClick(squareIndex)}
                onMouseEnter={() => handleMouseEnter(squareIndex)}
                onMouseLeave={() => handleMouseLeave(selectedSquare !== null)}
                isSelected={selectedSquare === squareIndex}
                isValidMove={isValidMove}
                isKingInCheck={isKingInCheck}
                isAnimated={lastMovedSquare === squareIndex}
                isOpponentPiece={isOpponentPiece}
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
