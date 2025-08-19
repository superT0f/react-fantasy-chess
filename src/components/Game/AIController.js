import { useState, useCallback } from 'react';
import ChessAI from '../../logic/ChessAI';

export function useAIController({ gameMode, aiDifficulty, referee, gameStatus }) {
    const [isAiThinking, setIsAiThinking] = useState(false);

    const makeAiMove = useCallback((currentSquares, handleMove) => {
        if (!currentSquares || gameStatus !== 'playing') return;
        if (referee.getCurrentPlayer() !== 'black') return;
        const move = ChessAI.getRandomMove(referee.getHistory(), currentSquares, 'black');
        if (move) {
            const { from, to, enPassantTarget } = move;

            let state = {
                selectedSquare: from,
                validMoves: referee.getAllValidMoves(from, currentSquares, enPassantTarget),
                enPassantTarget,
                isOpponentPiece: false,
                lastMovedSquare: null
            };

            const result = referee.handleSquareClick(
                to,
                state,
                currentSquares,
                enPassantTarget
            );

            if (result.moveData) {
                const { from, to, isEnPassant } = result.moveData;
                const newSquares = [...currentSquares];
                const captured = newSquares[to] !== '' ? newSquares[to] : null;

                newSquares[to] = newSquares[from];
                newSquares[from] = '';

                if (isEnPassant) {
                    newSquares[to + (referee.getCurrentPlayer() === 'white' ? -8 : 8)] = '';
                }

                handleMove(
                    newSquares,
                    from,
                    to,
                    captured,
                    isEnPassant,
                    true
                );
            }
        }

    }, [gameStatus, referee]);

    return { isAiThinking, setIsAiThinking, makeAiMove };
}