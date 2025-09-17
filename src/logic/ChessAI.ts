import openings from '../assets/openings.json';
import PgnNotation from './PgnNotation';
import chessEngine from './chessEngine';
import { Chess, Square, Move } from 'chess.js';

export default class ChessAI {
    static moveQualityEstimator: Function = ChessAI.estimateMoveQuality;
    static chess: Chess = chessEngine.getChess();

    // Allow custom estimators
    static setMoveQualityEstimator(estimator: Function): void {
        ChessAI.moveQualityEstimator = estimator;
    }

    static getAIMove(chess: Chess, difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Move | null {
        let searchDepth: number;

        switch (difficulty) {
            case 'easy': searchDepth = 2; break;
            case 'medium': searchDepth = 4; break;
            case 'hard': searchDepth = 6; break;
            default: searchDepth = 2;
        }

        if (chess.history().length === 0) {
            const bestMoves: Move[] = [
                { from: 'e2', to: 'e4' } as Move,
                { from: 'd2', to: 'd4' } as Move,
                { from: 'b1', to: 'c3' } as Move,
            ];
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }

        // Use book moves in opening/middle
        if (chess.history().length < 18) {
            const bookMove = this.getBookMove(chess.history({ verbose: true }));
            if (bookMove) {
                return bookMove;
            }
        }

        // Get all valid moves first to check if any exist
        const validMoves = chess.moves({ verbose: true }) as Move[];
        if (validMoves.length === 0) {
            console.warn('No valid moves found for AI');
            return null;
        }

        const result = this.minimax(validMoves, searchDepth, -Infinity, Infinity, true);

        // Ensure we have a valid move
        if (!result.move) {
            console.warn('Minimax returned no move, falling back to random move');
            return validMoves[0]; // Return first valid move as fallback
        }

        return result.move;
    }

    static handleEndgame(squares: string[], player: string): Move | null {
        // Count pieces to identify endgame
        const pieceCount = squares.filter(p => p !== '').length;

        if (pieceCount <= 7) { // Simplified endgame detection
            // Implement basic endgame strategies
            return this.getEndgameMove(squares, player);
        }

        return null;
    }

    static minimax(validMoves: Move[], depth: number, alpha: number, beta: number, isMaximizing: boolean): { score: number, move: Move | null } {
        if (depth === 0) {
            const score = this.evaluateBoard();
            return { score: score, move: null };
        }

        if (validMoves.length === 0) {
            return {
                score: isMaximizing ? -Infinity : Infinity,
                move: null
            };
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            let bestMove: Move | null = null;

            for (const move of validMoves) {
                this.chess.move(move);
                const evaluation = this.minimax(
                    this.chess.moves({ verbose: true }) as Move[],
                    depth - 1,
                    alpha,
                    beta,
                    false
                ).score;
                this.chess.undo();

                if (evaluation > maxEval) {
                    maxEval = evaluation;
                    bestMove = move;
                }

                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }

            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            let bestMove: Move | null = null;

            for (const move of validMoves) {
                this.chess.move(move);
                const evaluation = this.minimax(
                    this.chess.moves({ verbose: true }) as Move[],
                    depth - 1,
                    alpha,
                    beta,
                    true
                ).score;
                this.chess.undo();

                if (evaluation < minEval) {
                    minEval = evaluation;
                    bestMove = move;
                }

                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }

            return { score: minEval, move: bestMove };
        }
    }

    static evaluateBoard(): number {
        let score = 0;

        // entities values
        const values: Record<string, number> = {
            'p': 1,
            'n': 3,
            'b': 3,
            'r': 5,
            'q': 9,
            'k': 10000
        };

        // Material count
        for (let i = 0; i < 64; i++) {
            const piece = this.chess.get(PgnNotation.idxToXY(i) as Square);
            if (!piece) continue;
            const entityValue = values[piece.type] || 0;

            if (piece.color === this.chess.turn()) {
                score += entityValue;
            } else {
                score -= entityValue;
            }
        }

        return score;
    }

    static estimateMoveQuality(from: number, to: number, squares: string[]): number {
        let score = 0;
        const value: Record<string, number> = {
            'p': 1, 'P': 1,
            'n': 3, 'N': 3,
            'b': 3, 'B': 3,
            'r': 5, 'R': 5,
            'q': 9, 'Q': 9,
            'k': 100, 'K': 100
        };

        const entityChar = squares[from];
        const target = squares[to];
        const entityType = entityChar.toLowerCase();
        const fromCol = from % 8;
        const toRow = Math.floor(to / 8);
        const toCol = to % 8;

        // 1. Material evaluation (MVV-LVA)
        if (target) {
            const attackerValue = value[entityType] || 0;
            const victimValue = value[target.toLowerCase()] || 0;
            score += (victimValue * 10) - attackerValue;

            // Bonus for capturing with less valuable piece
            if (attackerValue < victimValue) {
                score += 5;
            }
        }

        // 2. Positional evaluation
        const positionBonus = this.getPositionBonus(entityType, to, squares);
        score += positionBonus;

        // 3. Piece-specific bonuses
        switch (entityType) {
            case 'p': // Pawn
                // Passed pawn bonus
                if (this.isPassedPawn(to, squares, entityChar === 'P' ? 'white' : 'black')) {
                    score += 2;
                }
                // Doubled pawn penalty
                if (this.isDoubledPawn(from, squares, entityChar === 'P' ? 'white' : 'black')) {
                    score -= 1;
                }
                break;

            case 'n': // Knight
                // Knights love outposts (protected squares in enemy territory)
                if (this.isKnightOutpost(to, squares, entityChar === 'N' ? 'white' : 'black')) {
                    score += 3;
                }
                break;

            case 'b': // Bishop
                // Bishop pair bonus
                if (this.hasBishopPair(from, squares, entityChar === 'B' ? 'white' : 'black')) {
                    score += 1;
                }
                break;

            case 'r': // Rook
                // Rook on open file bonus
                if (this.isOpenFile(toCol, squares)) {
                    score += 2;
                }
                // Rook on seventh rank bonus
                if ((entityChar === 'R' && toRow === 1) || (entityChar === 'r' && toRow === 6)) {
                    score += 3;
                }
                break;

            case 'k': // King
                // King safety - encourage castling
                if (Math.abs(fromCol - toCol) === 2) {
                    score += 5;
                }
                // King in center during opening is bad
                if (this.isInCenter(to) && squares.filter(p => p !== '').length > 20) {
                    score -= 3;
                }
                break;
        }

        return Math.round(score * 100) / 100; // Round to 2 decimal places
    }

    // Helper methods for enhanced evaluation
    static getPositionBonus(_pieceType: string, square: number, _squares: string[]): number {
        // Piece-square tables (simplified examples)
        const centerSquares = [27, 28, 35, 36]; // d4, e4, d5, e5
        const extendedCenter = [18, 19, 20, 21, 26, 27, 28, 29, 34, 35, 36, 37, 42, 43, 44, 45];

        if (centerSquares.includes(square)) return 3;
        if (extendedCenter.includes(square)) return 1;
        return 0;
    }

    static isPassedPawn(square: number, squares: string[], color: string): boolean {
        // Simplified passed pawn check
        const col = square % 8;
        const row = Math.floor(square / 8);
        const direction = color === 'white' ? -1 : 1;

        // Check if there are enemy pawns in front or on adjacent files
        for (let r = row + direction; color === 'white' ? r >= 0 : r < 8; r += direction) {
            for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
                const idx = r * 8 + c;
                const piece = squares[idx];
                if (piece && piece.toLowerCase() === 'p' && this.getColorByEntity(piece) !== color) {
                    return false;
                }
            }
        }
        return true;
    }

    static isDoubledPawn(square: number, squares: string[], color: string): boolean {
        const col = square % 8;
        const pawnChar = color === 'white' ? 'P' : 'p';

        // Count pawns on the same file
        let pawnCount = 0;
        for (let row = 0; row < 8; row++) {
            const idx = row * 8 + col;
            if (squares[idx] === pawnChar) {
                pawnCount++;
            }
        }

        return pawnCount > 1;
    }

    static isKnightOutpost(square: number, squares: string[], color: string): boolean {
        const row = Math.floor(square / 8);
        const isInEnemyTerritory = color === 'white' ? row <= 3 : row >= 4;
        const isProtected = this.isSquareProtected(square, squares, color);

        return isInEnemyTerritory && isProtected;
    }

    static isSquareProtected(_square: number, _squares: string[], _color: string): boolean {
        // Check if square is attacked by friendly pieces
        return false;
    }

    static hasBishopPair(_square: number, squares: string[], color: string): boolean {
        const bishopChar = color === 'white' ? 'B' : 'b';
        let bishopCount = 0;

        for (let i = 0; i < 64; i++) {
            if (squares[i] === bishopChar) {
                bishopCount++;
            }
        }

        return bishopCount >= 2;
    }

    static isOpenFile(col: number, squares: string[]): boolean {
        // Check if file has no pawns
        for (let row = 0; row < 8; row++) {
            const idx = row * 8 + col;
            if (squares[idx] && squares[idx].toLowerCase() === 'p') {
                return false;
            }
        }
        return true;
    }

    static isInCenter(square: number): boolean {
        const col = square % 8;
        const row = Math.floor(square / 8);
        return col >= 3 && col <= 4 && row >= 3 && row <= 4;
    }

    static getBookMove(moveHistory: Move[]): Move | null {
        // Filter out any invalid moves
        const validMoves = moveHistory.filter(move =>
            move.from !== undefined && move.to !== undefined
        );

        if (validMoves.length === 0) return null;

        const currentMoves = validMoves.map(move =>
            move.from + move.to
        ).join(',');

        for (const opening of openings.openings) {
            const openingMoves = opening.moves.slice(0, validMoves.length).join(',');
            if (currentMoves === openingMoves) {
                const nextMove = opening.moves[validMoves.length];
                if (nextMove) {
                    const from = nextMove.substring(0, 2);
                    const to = nextMove.substring(2, 4);
                    return { from, to } as Move;
                }
            }
        }
        return null;
    }

    static getEndgameMove(_squares: string[], _player: string): Move | null {
        // Implement endgame logic here
        return null;
    }

    static getColorByEntity(entity: string): string {
        return entity === entity.toUpperCase() ? 'white' : 'black';
    }
}