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

      let state = {
        selectedSquare: from,
        validMoves: referee.getAllValidMoves(from, currentSquares, enPassantTarget),
        enPassantTarget,
        isOpponentPiece: false,
        lastMovedSquare: null
      };
      
      const { newState, moveData } = referee.handleSquareClick(
        to,
        state
      );
      
      if (moveData) {
        const newSquares = [...referee.getCurrentBoard()];
        const captured = newSquares[moveData.to];

        if (moveData.isCastle) {
          const direction = moveData.to % 8 > moveData.from % 8 ? 1 : -1;
          const rookFromCol = direction === 1 ? 7 : 0;
          const rookToCol = direction === 1 ? 5 : 3;
          const rookFrom = Math.floor(moveData.from / 8) * 8 + rookFromCol;
          const rookTo = Math.floor(moveData.from / 8) * 8 + rookToCol;

          newSquares[rookTo] = referee.getSquare(rookFrom);
          newSquares[moveData.from] = '';
        } else {
          newSquares[moveData.to] = newSquares[moveData.from];
          newSquares[moveData.from] = '';
        }

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
          isCheck: Entity.isCheck(newSquares, referee.getCurrentPlayer()),
          isCheckmate: Entity.isCheckmate(newSquares, referee.getCurrentOpponent()),
          isCastle: moveData.isCastle,
          isFromIA: true, // Mark as AI move
          isPromotion: isPromotionMove,
          promotionPiece: isPromotionMove ? 'q' : null
        });
        
        onMove(moveDataObj);
      } else {
        console.warn('makeAiMove : moveData is falsy');
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