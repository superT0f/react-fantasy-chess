import openings from '../assets/openings.json';
import PgnNotation from './PgnNotation';
import Entity from './Entity';

export default class ChessAI {
    static getRandomMove(moveHistory, squares, player) {
        if (player !== 'black') {
            throw new Error('AI can only play as black');
        }
        if (moveHistory.length < 10) {
            const openingMove = this.getBookMove(moveHistory);
            if (openingMove) return openingMove;
        }
        const validMoves = [];

        for (let from = 0; from < 64; from++) {
            const entityChar = squares[from];
            if (entityChar && Entity.getColorByEntity(entityChar) === player) {
                const entity = Entity.fromChar(entityChar, from, squares);
                for (let to = 0; to < 64; to++) {
                    if (entity.isValidMove(to)) {
                        const simulatedBoard = Entity.simulateMove(squares, from, to);
                        if (!Entity.isCheck(simulatedBoard, player)) {
                            validMoves.push({ from, to });
                        }
                    }
                }
            }
        }

        if (validMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * validMoves.length);

            return validMoves[randomIndex];
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