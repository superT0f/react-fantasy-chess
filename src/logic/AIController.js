import { useState, useCallback } from 'react';
import ChessAI from './ChessAI';
import { BLACK, Chess, piece } from 'chess.js';
import chessEngine from './chessEngine';


export function useAIController({ gameMode, aiDifficulty, isAiAggressive, gameStatus }) {
    /**
     * @type {Chess} */
    const chess = chessEngine.getChess();
    const [isAiThinking, setIsAiThinking] = useState(false);

    const makeAiMove = useCallback((onMove, setIsAiThinking) => {
        if (chess.isGameOver() ||
            gameStatus !== 'playing') return;

        if (isAiAggressive) {
            const aggressiveEstimator = (from, to, squares) => {
                let score = ChessAI.estimateMoveQuality(from, to, squares);
                /**
                 * @type {piece | null} */
                const piece = chess.get(from);
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