import openings from '../assets/openings.json';
import PgnNotation from './PgnNotation';
import Entity from './Entity';

export default class ChessAI {
    static getRandomMove(referee, squares, player) {
        if (player !== 'black') {
            throw new Error('AI can only play as black');
        }
        if (referee.getHistory().length < 10) {
            const openingMove = this.getBookMove(referee.getHistory());
            if (openingMove) {
                const entityChar = squares[openingMove.from];

                const entity = Entity.fromChar(entityChar, openingMove.from, squares);
                if (entity.isValidMove(openingMove.to)) {
                    const simulatedBoard = Entity.simulateMove(
                        squares,
                        openingMove.from,
                        openingMove.to);
                    if (!Entity.isCheck(simulatedBoard, player)) {
                        return openingMove;
                    }
                } else {
                    console.warn(`openning move is not valid : ${openingMove.from}->${openingMove.to}`)
                }

            }
        }
        const validMoves = [];

        for (let from = 0; from < 64; from++) {
            const entityChar = squares[from];
            if (referee.getSquareColor(from) === player) {
                const entity = Entity.fromChar(entityChar, from, squares);
                let enPassantTarget = entity.enPassantTarget;
                referee.getAllValidMoves(from, enPassantTarget).forEach((to) => {
                    validMoves.push({ from, to, enPassantTarget });
                });
            }
        }

        if (validMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * validMoves.length);
            return validMoves[randomIndex];
        } else {
            console.warn('No valid moves found for AI');
        }

        return null;
    }
    static getBookMove(moveHistory) {
        const currentMoves = moveHistory.map(move =>
            PgnNotation.idxToXY(move.from) + PgnNotation.idxToXY(move.to)
        ).join(',');

        for (const opening of openings.openings) {
            const openingMoves = opening.moves.slice(0, moveHistory.length + 1).join(',');
            if (currentMoves === openingMoves) {
                const nextMove = opening.moves[moveHistory.length];
                if (nextMove) {
                    const from = PgnNotation.xyToIdx(nextMove.substring(0, 2));
                    const to = PgnNotation.xyToIdx(nextMove.substring(2, 4));
                    return { from, to };
                }
            }
        }
        return null;
    }
}