import { useState, useCallback } from 'react';
import ChessAI from '../../logic/ChessAI';
import MoveData from '../../logic/MoveData';
import Entity from '../../logic/Entity';

export function useAIController({ gameMode, aiDifficulty, referee, gameStatus }) {
    const [isAiThinking, setIsAiThinking] = useState(false);

    const makeAiMove = useCallback((currentSquares, onMove) => {
        if (!currentSquares || gameStatus !== 'playing') return;

        if (gameMode === 'ai' && referee.getCurrentPlayer() === 'black') {
            const move = ChessAI.getRandomMove(referee, currentSquares, 'black');
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
                        const rookTo   = Math.floor(moveData.from / 8) * 8 + rookToCol;
                
                        newSquares[rookTo] = referee.getSquare(rookFrom);
                        newSquares[moveData.from] = '';
                      } else {
                        newSquares[moveData.to] = newSquares[moveData.from];
                        newSquares[moveData.from] = '';
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
                        isFromIA: false
                      });
                      onMove(moveDataObj);
                    } else {
                        console.warn('makeAiMove : moveData is falsy');
                    }
            }else{
                console.warn('AI could not find a valid move');
            }
        }else{
            console.warn('AI is not allowed to play in this mode or it is not its turn');
        }
    }, [gameStatus, referee, gameMode]);

    return { isAiThinking, setIsAiThinking, makeAiMove };
}