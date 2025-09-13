import { useState } from 'react';
import chessEngine from '../logic/chessEngine';

export function useBoardState(onMove, onPromotion) {
  const [localState, setLocalState] = useState({
    selectedSquare: null,
    validMoves: [],
    lastMovedSquare: null,
    isOpponentPiece: false,
    promotionSquare: null
  });

  const handleSquareClick = (toSquare, gameStatus) => {
    const chess = chessEngine.getChess();
    const fromSquare = localState.selectedSquare;

    if (gameStatus !== 'playing' || chess.isGameOver()) return;
    
    const pieceFrom = chess.get(fromSquare);
    const pieceTo = chess.get(toSquare);

    if (!pieceTo && !fromSquare) return;
    if (fromSquare === toSquare) {
      // Deselect if clicking the same square
      setLocalState({
        selectedSquare: null,
        validMoves: [],
        isOpponentPiece: false
      });
      return;
    }

    if (pieceTo?.color !== chess.turn() && !fromSquare) {
      // Clicked on opponent's piece without selecting own piece
      return;
    }
    if (pieceTo?.color === chess.turn()) {
      // Own piece selection
      const moves = chess.moves({ square: toSquare, verbose: true });
      setLocalState({
        selectedSquare: toSquare,
        validMoves: moves.map(move => move.to),
        isOpponentPiece: false
      });
      return;
    } 
    
    if (pieceFrom) {
      // Pawn promotion check
      if (pieceFrom?.type === 'p' && (toSquare[1] === '8' || toSquare[1] === '1')) {
        onPromotion(fromSquare, toSquare);
        return;
      }

      // Regular move attempt
      try {

        const move = chessEngine.move({ from: fromSquare, to: toSquare });
        // chess.move({ from: fromSquare, to: toSquare });

        setLocalState({
          selectedSquare: null,
          validMoves: [],
          isOpponentPiece: false
        });
        onMove(move);
      } catch (error) {
        console.log('Invalid move:', error);
      }
    }
  };

  const handleMouseEnter = (square) => {
    const chess = chessEngine.getChess();
    if (chess.isGameOver()) return;
    
    const piece = chess.get(square);
    if (!localState.selectedSquare && piece) {
      const moves = chess.moves({ square: square, verbose: true });
      setLocalState(prev => ({
        ...prev,
        isOpponentPiece: piece.color !== chess.turn(),
        validMoves: moves.map(move => move.to)
      }));
    }
  };

  const handleMouseLeave = () => {
    if (localState.selectedSquare) return;
    setLocalState(prev => ({ ...prev, validMoves: [] }));
  };

  return { localState, handleSquareClick, handleMouseEnter, handleMouseLeave };
}