import { useState, useCallback } from 'react';
import ChessAI from './ChessAI';
import MoveData from './MoveData';
import Entity from './Entity';

export function useAIController({ gameMode, aiDifficulty, isAiAggressive, referee, gameStatus }) {
    const [isAiThinking, setIsAiThinking] = useState(false);

    const makeAiMove = useCallback((currentSquares, onMove) => {
        if (!currentSquares || gameStatus !== 'playing') return;

        if (gameMode === 'ai' && referee.getCurrentPlayer() === 'black') {
            // Use the aggressive mode setting from props
            if (isAiAggressive) {
                const aggressiveEstimator = (from, to, squares) => {
                    let score = ChessAI.estimateMoveQuality(from, to, squares);
                    // Add aggressive bonuses
                    const entityChar = squares[from];
                    if (entityChar && entityChar.toLowerCase() !== 'p') {
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
                referee,
                currentSquares,
                'black',
                aiDifficulty
            );

            if (move) {
                const { from, to, enPassantTarget } = move;

                // Use referee's handleSquareClick to process the move
                // This will handle castling, en passant, and other special moves automatically
                let state = {
                    selectedSquare: from,
                    validMoves: referee.getAllValidMoves(from, currentSquares, enPassantTarget),
                    enPassantTarget,
                    isOpponentPiece: false,
                    lastMovedSquare: null
                };

                const { moveData } = referee.handleSquareClick(to, state);

                if (moveData) {
                    // Create the new board state using referee's simulateMove
                    const newSquares = referee.simulateMove(
                        currentSquares,
                        moveData.from,
                        moveData.to,
                        moveData.isCastle,
                        moveData.isEnPassant
                    );

                    const captured = currentSquares[moveData.to];

                    // Check if this is a promotion move for AI
                    const isPromotionMove = referee.isPromotionMove(moveData.from, moveData.to);
                    if (isPromotionMove) {
                        // Auto-promote to queen for AI
                        const promotionChar = 'black' === 'white' ? 'Q' : 'q';
                        newSquares[moveData.to] = promotionChar;
                    }

                    const moveDataObj = new MoveData({
                        from: moveData.from,
                        to: moveData.to,
                        squares: newSquares,
                        captured,
                        isEnPassant: moveData.isEnPassant,
                        isCheck: referee.isCheck(newSquares, referee.getCurrentPlayer()),
                        isCheckmate: referee.isCheckmate(newSquares, referee.getCurrentOpponent()),
                        isCastle: moveData.isCastle,
                        isFromIA: true, // Mark as AI move
                        isPromotion: isPromotionMove,
                        promotionPiece: isPromotionMove ? 'q' : null
                    });

                    onMove(moveDataObj);
                } else {
                    console.warn('makeAiMove: moveData is falsy after referee processing');
                }
            } else {
                console.log('AI could not find a valid move, GGWP');
            }
        } else {
            console.warn('AI is not allowed to play in this mode or it is not its turn');
        }
    }, [gameStatus, referee, gameMode, aiDifficulty, isAiAggressive]);

    return { isAiThinking, setIsAiThinking, makeAiMove };
}