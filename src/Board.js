import { useState } from 'react';
import { Square } from './Square';
export function Board({ currentPlayer, squares, onMove, enPassantTarget, lastDoubleStepPawn }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMovedSquare, setLastMovedSquare] = useState(null);
  // const [hoveredPiece, setHoveredPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  function handleMouseEnter(i) {
    if (squares[i] 
    //  && getPieceColor(squares[i]) === currentPlayer
    ) {
     // setHoveredPiece(i);
      setValidMoves(getAllValidMoves(i));
    }
  }

  function handleMouseLeave(aSquareIsSelected) {
    if (aSquareIsSelected) return;
    //setHoveredPiece(null);
    setValidMoves([]);
  }


function getAllValidMoves(from) {
  const moves = [];
  if (!squares[from] 
  //  || getPieceColor(squares[from]) !== currentPlayer
  ) 
    return moves;

  for (let to = 0; to < 64; to++) {
    if (isValidMove(from, to)) {
      moves.push(to);
    }
  }
  return moves;
}

  function isPathClear(from, to, pieceType) {
  if (pieceType === 'n') return true; // Les cavaliers sautent par-dessus les pièces

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

  function getPieceColor(piece) {
    if (!piece) return null;
    return piece === piece.toUpperCase() ? 'white' : 'black';
  }

  function isValidMove(from, to) {
    if (from === to) return false;

    const piece = squares[from];
    if (!piece) return false;

    const pieceType = piece.toLowerCase();
    const pieceColor = getPieceColor(piece);

    // if (pieceColor !== currentPlayer) return false;

    const topiece = squares[to];
    if (topiece && getPieceColor(topiece) === pieceColor) return false;

    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // Règles de déplacement de base
    switch (pieceType) {
      case 'p': // Pion
        const direction = pieceColor === 'white' ? -1 : 1;
        const startRow = pieceColor === 'white' ? 6 : 1;
        const enPassantRow = pieceColor === 'white' ? 3 : 4;
        
        // Déplacement avant
        if (fromCol === toCol) {
          // Déplacement d'une case
          if (toRow === fromRow + direction && squares[to] === '') 
            return true;
          
          // Déplacement de deux cases
          if (fromRow === startRow && 
              toRow === fromRow + 2 * direction && 
              squares[to] === '' &&
              isPathClear(from, to, pieceType)) 
            return true;
        }
        
        // Capture normale
        if (colDiff === 1 && rowDiff === 1 && 
            squares[to] !== '' && 
            getPieceColor(squares[to]) !== pieceColor) {
          return true;
        }
        
        // Prise en passant
        if (colDiff === 1 && rowDiff === 1 && 
            toRow === enPassantRow &&
            to === enPassantTarget) {
          // Vérifier si le pion adverse a fait un double pas précédemment
          const adjacentCol = toCol;
          const adjacentRow = fromRow; // Même rangée que le pion attaquant
          const adjacentIndex = adjacentRow * 8 + adjacentCol;

          if (adjacentIndex === lastDoubleStepPawn) {
            return true;
          }
        }
        return false;
      case 'r': // Tour
        return isPathClear(from, to, pieceType) &&
        (fromRow === toRow || fromCol === toCol);

      case 'n': // Cavalier
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case 'b': // Fou
      return isPathClear(from, to, pieceType) &&
         rowDiff === colDiff;

      case 'q': // Reine
      return isPathClear(from, to, pieceType) &&
        (fromRow === toRow || fromCol === toCol || rowDiff === colDiff);

      case 'k': // Roi
      return isPathClear(from, to, pieceType) &&
        rowDiff <= 1 && colDiff <= 1;

      default:
        return false;
    }
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
            // Calcul de l'index de la pièce capturée
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
