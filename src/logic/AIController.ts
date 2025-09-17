import { useState, useCallback } from 'react';
import ChessAI from './ChessAI';
import { Move, Square } from 'chess.js';
import chessEngine from './chessEngine';
import PgnNotation from './PgnNotation';

interface UseAIControllerProps {
  gameMode: 'pvp' | 'ai' | 'online' | null;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  isAiAggressive: boolean;
  gameStatus: string;
}

interface UseAIControllerReturn {
  isAiThinking: boolean;
  setIsAiThinking: React.Dispatch<React.SetStateAction<boolean>>;
  makeAiMove: (onMove: (move: Move) => void, setIsAiThinking: React.Dispatch<React.SetStateAction<boolean>>) => boolean;
}

export function useAIController({
  gameMode,
  aiDifficulty,
  isAiAggressive,
  gameStatus
}: UseAIControllerProps): UseAIControllerReturn {
  const chess = chessEngine.getChess();
  const [isAiThinking, setIsAiThinking] = useState(false);

  const makeAiMove = useCallback((onMove: (move: Move) => void, setIsAiThinking: React.Dispatch<React.SetStateAction<boolean>>): boolean => {
    if (chess.isGameOver() || gameStatus !== 'playing') return false;

    if (isAiAggressive) {
      const aggressiveEstimator = (from: number, to: number, squares: string[]): number => {
        let score = ChessAI.estimateMoveQuality(from, to, squares);
        const piece = chess.get(PgnNotation.idxToXY(from) as Square);
        if (piece && piece.type !== 'p') {
          score += 2; // Bonus for moving pieces (not pawns)
        }
        return score;
      };

      // Set custom estimator
      ChessAI.setMoveQualityEstimator(aggressiveEstimator);
    } else {
      // Reset to default estimator if not aggressive
      ChessAI.setMoveQualityEstimator(ChessAI.estimateMoveQuality);
    }

    const move = ChessAI.getAIMove(
      chess,
      aiDifficulty
    );

    if (move) {
      onMove(chess.move(move));
      setIsAiThinking(false);
      return true;
    } else {
      console.warn('makeAiMove: moveData is falsy after processing');
    }
    
    setIsAiThinking(false);
    return false;
  }, [gameStatus, gameMode, aiDifficulty, isAiAggressive]);

  return { isAiThinking, setIsAiThinking, makeAiMove };
}