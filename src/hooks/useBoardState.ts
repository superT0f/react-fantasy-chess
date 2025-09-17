import { useState } from 'react';
import { Square, Piece, Move } from 'chess.js';
import chessEngine from '../logic/chessEngine';

interface UseBoardStateReturn {
  localState: LocalBoardState;
  handleSquareClick: (square: Square, gameStatus: string) => void;
  handleMouseEnter: (square: Square) => void;
  handleMouseLeave: (hasSelectedSquare: boolean) => void;
}

interface LocalBoardState {
  selectedSquare: Square | null;
  validMoves: Square[];
  lastMovedSquare?: Square | null;
  promotionSquare?: Square | null;
}

export function useBoardState(
  onMove: (move: Move) => void,
  onPromotion: (from: Square, to: Square) => void
): UseBoardStateReturn {

  const [localState, setLocalState] = useState<LocalBoardState>({
    selectedSquare: null,
    validMoves: [],
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
        validMoves: [],
      });
      return;
    }

    if (pieceTo?.color !== chess.turn() && !fromSquare) {
      // Clicked on opponent's piece without selecting own piece
      return;
    }
    if (pieceTo?.color === chess.turn()) {

      setLocalState({
        selectedSquare: toSquare,
        validMoves: (chess.moves as unknown as Move[]).map((move: Move) => move.to),
        lastMovedSquare: null,
        promotionSquare: null,
    });
  }

  if (pieceFrom && fromSquare) {
    // Pawn promotion check
    if (pieceFrom?.type === 'p' && (toSquare[1] === '8' || toSquare[1] === '1')) {
      onPromotion(fromSquare, toSquare);
      // the actual move will be handled after promotion
      return;
    }

    // Regular move attempt
    try {

      const move = chessEngine.move({ from: fromSquare, to: toSquare });
      setLocalState({
        selectedSquare: null,
        validMoves: [],
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
      validMoves: moves.map((move: { to: Square }) => move.to)
    }));
  }
};

const handleMouseLeave = () => {
  if (localState.selectedSquare) return;
  setLocalState(prev => ({ ...prev, validMoves: [] }));
};

return { localState, handleSquareClick, handleMouseEnter, handleMouseLeave };
}