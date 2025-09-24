import { useState } from 'react';
import { Square, Piece, Move, WHITE } from 'chess.js';
import chessEngine from '../logic/chessEngine';

interface UseBoardStateReturn {
  localState: LocalBoardState;
  handleSquareClick: (square: Square, gameStatus: string) => void;
  handleMouseEnter: (square: Square) => void;
  handleMouseLeave: (hasSelectedSquare: boolean) => void;
}

interface LocalBoardState {
  selectedSquare: Square | null;
  validSquares: Square[];
  lastMovedSquare?: Square | null;
  promotionSquare?: Square | null;
}

export function useBoardState(
  onMove: (move: Move) => void,
  onPromotion: (from: Square, to: Square) => void
): UseBoardStateReturn {

  const [localState, setLocalState] = useState<LocalBoardState>({
    selectedSquare: null,
    validSquares: [],
  });

  const handleSquareClick = (toSquare: Square, gameStatus: string) => {
    const chess = chessEngine.getChess();
    const fromSquare = localState.selectedSquare;

    if (gameStatus !== 'playing' || chess.isGameOver()) return;
    const pieceTo = chess.get(toSquare);
    if (!pieceTo && !fromSquare) return;

    const pieceFrom = fromSquare && chess.get(fromSquare);
    if (fromSquare === toSquare) {
      // Deselect if clicking the same square
      setLocalState({
        selectedSquare: null,
        validSquares: [],
      });
      return;
    }

    if (pieceTo?.color !== chess.turn() && !fromSquare) {
      // Clicked on opponent's piece without selecting own piece
      return;
    }
    if (pieceTo?.color === chess.turn()) {
      const moves = chess.moves({ square: toSquare, verbose: true });
      const validSquares = moves.map((move: Move) => move.to);

      setLocalState({
        selectedSquare: toSquare,
        validSquares: validSquares,
        lastMovedSquare: null,
        promotionSquare: null,
    });
  }

  if (pieceFrom && fromSquare) {
    // Pawn promotion check
    const promoteRow = (chess.turn() === WHITE) ? '1' : '8';
    if (pieceFrom?.type === 'p' && (toSquare[1] === promoteRow)) {
      onPromotion(fromSquare, toSquare);
      // the actual move will be handled after promotion
      return;
    }

    // Regular move attempt
    try {

      const move = chessEngine.move({ from: fromSquare, to: toSquare });
      setLocalState({
        selectedSquare: null,
        validSquares: [],
      });
      onMove(move);
    } catch (error) {
      console.log('Invalid move:', error);
    }
  }
};

const handleMouseEnter = (square:Square) => {
  const chess = chessEngine.getChess();
  if (chess.isGameOver()) return;

  const piece = chess.get(square) as Piece | null;
  if (!localState.selectedSquare && piece) {
    const moves = chess.moves({ square: square, verbose: true });
    setLocalState((prev: LocalBoardState) => ({
      ...prev,
      isOpponentPiece: (piece.color as 'w' | 'b') !== chess.turn(),
      validSquares: moves.map((move: { to: Square }) => move.to)
    }));
  }
};

const handleMouseLeave = () => {
  if (localState.selectedSquare) return;
  setLocalState(prev => ({ ...prev, validSquares: [] }));
};

return { localState, handleSquareClick, handleMouseEnter, handleMouseLeave };
}