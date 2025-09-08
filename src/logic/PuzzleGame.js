import PgnNotation from './PgnNotation';
import Log from '../Log';

export default class PuzzleGame {
    constructor() {
        this.puzzles = require('../assets/puzzles.json').puzzles;
        this.currentPuzzle = null;
        this.currentMoveIndex = 0;
        this.feedback = '';
        this.solvedPuzzles = new Set();
        this.failedPuzzles = new Set();
    }
    loadPuzzle(puzzleId) {
        Log.debug(`loadPuzzle ${puzzleId}`);
        const puzzle = this.puzzles.find(p => p.id === puzzleId);

        if (!puzzle) {
            throw new Error(`Puzzle with ID ${puzzleId} not found`);
        }

        this.currentPuzzle = puzzle;
        this.currentMoveIndex = 0;
        this.feedback = 'Find the best move!';

        // Parse FEN and set up the board
        const fenParts = puzzle.fen.split(' ');
        const board = this.parseFen(fenParts[0]);

        return puzzle;
    }

    parseFen(fen) {
        const board = Array(64).fill('');
        let rank = 0;
        let file = 0;

        for (const char of fen) {
            if (char === '/') {
                rank++;
                file = 0;
            } else if (isNaN(char)) {
                const index = rank * 8 + file;
                board[index] = char;
                file++;
            } else {
                file += parseInt(char);
            }
        }

        return board;
    }

    validateMove(moveData) {
        if (!this.currentPuzzle) return { isValid: false, feedback: 'No puzzle loaded' };

        const expectedMove = this.currentPuzzle.solution[this.currentMoveIndex];
        const playerMove = PgnNotation.idxToXY(moveData.from) + PgnNotation.idxToXY(moveData.to);

        if (playerMove === expectedMove) {
            this.currentMoveIndex++;

            if (this.currentMoveIndex >= this.currentPuzzle.solution.length) {
                // Puzzle solved!
                this.solvedPuzzles.add(this.currentPuzzle.id);
                this.feedback = 'Puzzle solved! Congratulations!';
                this.resetToPuzzleState();
                return {
                    isValid: true,
                    isComplete: true,
                    feedback: this.feedback
                };
            } else {
                this.feedback = 'Correct! Good move.';
                return {
                    isValid: true,
                    isComplete: false,
                    feedback: this.feedback
                };
            }
        } else {
            this.failedPuzzles.add(this.currentPuzzle.id);
            this.feedback = 'Incorrect. Try again!';
            this.resetToPuzzleState();
            return {
                isValid: false,
                feedback: this.feedback
            };
        }
    }

    resetToPuzzleState() {
        if (!this.currentPuzzle) return;

        const board = this.parseFen(this.currentPuzzle.fen.split(' ')[0]);
        this.currentMoveIndex = 0;
    }

    getHint() {
        if (!this.currentPuzzle) return null;

        const nextMove = this.currentPuzzle.solution[this.currentMoveIndex];
        return {
            from: PgnNotation.xyToIdx(nextMove.substring(0, 2)),
            to: PgnNotation.xyToIdx(nextMove.substring(2, 4)),
            description: `Consider moving from ${nextMove.substring(0, 2)} to ${nextMove.substring(2, 4)}`
        };
    }

    getProgress() {
        const total = this.puzzles.length;
        const solved = this.solvedPuzzles.size;
        const failed = this.failedPuzzles.size;
        const remaining = total - solved - failed;

        return {
            total,
            solved,
            failed,
            remaining,
            percentage: Math.round((solved / total) * 100)
        };
    }

    getNextPuzzle() {
        const unsolved = this.puzzles.filter(p =>
            !this.solvedPuzzles.has(p.id) && !this.failedPuzzles.has(p.id)
        );

        if (unsolved.length === 0) return null;
        return unsolved[0];
    }

    getPuzzleDifficulty(puzzle) {
        // Simple difficulty estimation based on solution length
        if (puzzle.solution.length <= 2) return 'beginner';
        if (puzzle.solution.length <= 4) return 'intermediate';
        return 'advanced';
    }
}