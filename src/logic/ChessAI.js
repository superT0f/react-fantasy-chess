import openings from '../assets/openings.json';
import PgnNotation from './PgnNotation';
import Entity from './Entity';

export default class ChessAI {

    static moveQualityEstimator = ChessAI.estimateMoveQuality;

    // Allow custom estimators
    static setMoveQualityEstimator(estimator) {
        ChessAI.moveQualityEstimator = estimator;
    }

    static getAIMove(referee, squares, player, difficulty) {
        let searchDepth;

        switch (difficulty) {
            case 'easy':
                searchDepth = 2;
                break;
            case 'medium':
                searchDepth = 4;
                break;
            case 'hard':
                searchDepth = 6;
                break;
            default:
                searchDepth = 2;
        }

        // Use book moves in opening / middle
        if (referee.getHistory().length < 18) {
            const bookMove = this.getBookMove(referee.getHistory());
            if (bookMove) {
                return bookMove;
            }
        }

        return this.minimax(referee, searchDepth, -Infinity, Infinity, true, squares, player).move;
    }

    static handleEndgame(squares, player) {
        // Count pieces to identify endgame
        const pieceCount = squares.filter(p => p !== '').length;

        if (pieceCount <= 7) { // Simplified endgame detection
            // Implement basic endgame strategies
            return this.getEndgameMove(squares, player);
        }

        return null;
    }

    static iterativeDeepening(referee, squares, player, maxTime = 5000) {
        let bestMove = null;
        let depth = 1;
        const startTime = Date.now();

        while (Date.now() - startTime < maxTime && depth <= 6) {
            const result = this.minimax(referee, depth, -Infinity, Infinity, true, squares, player);
            bestMove = result.move;
            depth++;
        }

        return bestMove;
    }

    static minimax(referee, depth, alpha, beta, isMaximizing, squares, player) {
        if (depth === 0) {
            return { score: this.evaluateBoard(squares, player) };
        }

        const validMoves = referee.getAllValidMovesForPlayer(
            player,
            squares,
            null,
            true, // score moves
            ChessAI.moveQualityEstimator.bind(ChessAI) // Bind the context
        );
        if (isMaximizing) {
            let maxEval = -Infinity;
            let bestMove = null;

            for (const move of validMoves) {
                const newBoard = referee.simulateMove(squares, move.from, move.to);
                const evaluation = this.minimax(referee, depth - 1, alpha, beta, false, newBoard,
                    referee.getOpponent(player)).score;

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
            let bestMove = null;

            for (const move of validMoves) {
                const newBoard = referee.simulateMove(squares, move.from, move.to);
                const evaluation = this.minimax(referee, depth - 1, alpha, beta, true, newBoard,
                    referee.getOpponent(player)).score;

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

    static evaluateBoard(squares, player) {
        let score = 0;

        // entities values
        const values = {
            'p': 1, 'P': 1,
            'n': 3, 'N': 3,
            'b': 3, 'B': 3,
            'r': 5, 'R': 5,
            'q': 9, 'Q': 9,
            'k': 100, 'K': 100
        };

        // Position bonuses (simplified example)
        const pawnPositionBonus = [
            // ... position-based scoring tables
        ];

        // Material count
        for (let i = 0; i < 64; i++) {
            if (!squares[i]) continue;

            const enitityValue = values[squares[i]] || 0;
            const enitityColor = Entity.getColorByEntity(squares[i]);

            // Add position bonuses
            let positionBonus = 0;
            if (squares[i].toLowerCase() === 'p') {
                positionBonus = pawnPositionBonus[i] || 0;
            }

            if (enitityColor === player) {
                score += enitityValue + positionBonus;
            } else {
                score -= enitityValue + positionBonus;
            }
        }

        // Additional factors
        // score += this.evaluateMobility(squares, player);
        // score += this.evaluateKingSafety(squares, player);
        // score += this.evaluatePawnStructure(squares, player);

        return score;
    }

    static estimateMoveQuality(from, to, squares) {
        let score = 0;
        const value = {
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
        const fromRow = Math.floor(from / 8);
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

        // 4. Development and tempo
        if (squares.filter(p => p !== '').length > 20) { // Opening phase
            // Encourage developing minor pieces
            if ((entityType === 'n' || entityType === 'b') && fromRow === (entityChar === entityChar.toUpperCase() ? 7 : 0)) {
                score += 2;
            }

            // Discourage moving the same piece multiple times in opening
            // (This would require move history tracking)
        }

        return Math.round(score * 100) / 100; // Round to 2 decimal places
    }

    // Helper methods for enhanced evaluation
    static getPositionBonus(pieceType, square, squares) {
        // Piece-square tables (simplified examples)
        const centerSquares = [27, 28, 35, 36]; // d4, e4, d5, e5
        const extendedCenter = [18, 19, 20, 21, 26, 27, 28, 29, 34, 35, 36, 37, 42, 43, 44, 45];

        if (centerSquares.includes(square)) return 3;
        if (extendedCenter.includes(square)) return 1;
        return 0;
    }

    static isPassedPawn(square, squares, color) {
        // Simplified passed pawn check
        const col = square % 8;
        const row = Math.floor(square / 8);
        const direction = color === 'white' ? -1 : 1;

        // Check if there are enemy pawns in front or on adjacent files
        for (let r = row + direction; color === 'white' ? r >= 0 : r < 8; r += direction) {
            for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
                const idx = r * 8 + c;
                const piece = squares[idx];
                if (piece && piece.toLowerCase() === 'p' && Entity.getColorByEntity(piece) !== color) {
                    return false;
                }
            }
        }
        return true;
    }

    static isDoubledPawn(square, squares, color) {
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

    static isKnightOutpost(square, squares, color) {
        const row = Math.floor(square / 8);
        const isInEnemyTerritory = color === 'white' ? row <= 3 : row >= 4;
        const isProtected = this.isSquareProtected(square, squares, color);

        return isInEnemyTerritory && isProtected;
    }

    static isSquareProtected(square, squares, color) {
        // Check if square is attacked by friendly pieces
        for (let i = 0; i < 64; i++) {
            const piece = squares[i];
            if (piece && Entity.getColorByEntity(piece) === color) {
                const entity = Entity.fromChar(this.referee, i);
                if (entity && entity.isValidMove(square)) {
                    return true;
                }
            }
        }
        return false;
    }

    static hasBishopPair(square, squares, color) {
        const bishopChar = color === 'white' ? 'B' : 'b';
        let bishopCount = 0;

        for (let i = 0; i < 64; i++) {
            if (squares[i] === bishopChar) {
                bishopCount++;
            }
        }

        return bishopCount >= 2;
    }

    static isOpenFile(col, squares) {
        // Check if file has no pawns
        for (let row = 0; row < 8; row++) {
            const idx = row * 8 + col;
            if (squares[idx] && squares[idx].toLowerCase() === 'p') {
                return false;
            }
        }
        return true;
    }

    static isInCenter(square) {
        const col = square % 8;
        const row = Math.floor(square / 8);
        return col >= 3 && col <= 4 && row >= 3 && row <= 4;
    }

    static getRandomMove(referee, squares, player) {
        if (player !== 'black') {
            throw new Error('AI can only play as black');
        }
        if (referee.getHistory().length < 10) {
            const openingMove = this.getBookMove(referee.getHistory());
            if (openingMove) {
                const entityChar = squares[openingMove.from];

                const entity = Entity.fromChar(referee, openingMove.from);
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
                const entity = Entity.fromChar(referee, from);
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
        // Filter out the "Start" entry and any invalid moves
        const validMoves = moveHistory.filter(move =>
            move.pgn !== 'Start' && move.from !== undefined && move.to !== undefined
        );

        if (validMoves.length === 0) return null;

        const currentMoves = validMoves.map(move =>
            PgnNotation.idxToXY(move.from) + PgnNotation.idxToXY(move.to)
        ).join(',');

        for (const opening of openings.openings) {
            const openingMoves = opening.moves.slice(0, validMoves.length).join(',');
            if (currentMoves === openingMoves) {
                const nextMove = opening.moves[validMoves.length];
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