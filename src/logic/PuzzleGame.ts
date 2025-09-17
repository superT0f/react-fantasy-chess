import PgnNotation from './PgnNotation';
import { Logger } from '../utils/Logger';

export interface Puzzle {
  id: number;
  fen: string;
  solution: string[];
  description: string;
  theme: string;
  rating: number;
  source: string;
}

interface PuzzleValidationResult {
  isValid: boolean;
  isComplete?: boolean;
  feedback: string;
}

interface Hint {
  from: number;
  to: number;
  description: string;
}

interface PuzzleProgress {
  total: number;
  solved: number;
  failed: number;
  remaining: number;
  percentage: number;
}

export default class PuzzleGame {
  private puzzles: Puzzle[];
  private currentPuzzle: Puzzle | null;
  private currentMoveIndex: number;
  private feedback: string;
  private solvedPuzzles: Set<number>;
  private failedPuzzles: Set<number>;

  constructor() {
    const puzzlesData = require('../assets/puzzles.json');
    this.puzzles = puzzlesData.puzzles;
    this.currentPuzzle = null;
    this.currentMoveIndex = 0;
    this.feedback = '';
    this.solvedPuzzles = new Set();
    this.failedPuzzles = new Set();
  }

  loadPuzzle(puzzleId: number): Puzzle {
    Logger.debug(`loadPuzzle ${puzzleId}`);
    const puzzle = this.puzzles.find(p => p.id === puzzleId);

    if (!puzzle) {
      throw new Error(`Puzzle with ID ${puzzleId} not found`);
    }

    this.currentPuzzle = puzzle;
    this.currentMoveIndex = 0;
    this.feedback = 'Find the best move!';

    return puzzle;
  }

  validateMove(moveData: { from: number; to: number }): PuzzleValidationResult {
    if (!this.currentPuzzle) {
      return { isValid: false, feedback: 'No puzzle loaded' };
    }

    const expectedMove = this.currentPuzzle.solution[this.currentMoveIndex];
    const playerMove = PgnNotation.idxToXY(moveData.from) + PgnNotation.idxToXY(moveData.to);

    if (playerMove === expectedMove) {
      this.currentMoveIndex++;

      if (this.currentMoveIndex >= this.currentPuzzle.solution.length) {
        this.solvedPuzzles.add(this.currentPuzzle.id);
        this.feedback = 'Puzzle solved! Congratulations!';
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
      return {
        isValid: false,
        feedback: this.feedback
      };
    }
  }

  getHint(): Hint | null {
    if (!this.currentPuzzle) return null;

    const nextMove = this.currentPuzzle.solution[this.currentMoveIndex];
    return {
      from: PgnNotation.xyToIdx(nextMove.substring(0, 2) as any),
      to: PgnNotation.xyToIdx(nextMove.substring(2, 4) as any),
      description: `Consider moving from ${nextMove.substring(0, 2)} to ${nextMove.substring(2, 4)}`
    };
  }

  getProgress(): PuzzleProgress {
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

  getNextPuzzle(): Puzzle | null {
    const unsolved = this.puzzles.filter(p =>
      !this.solvedPuzzles.has(p.id) && !this.failedPuzzles.has(p.id)
    );

    return unsolved.length > 0 ? unsolved[0] : null;
  }

  getPuzzleDifficulty(puzzle: Puzzle): string {
    if (puzzle.solution.length <= 2) return 'beginner';
    if (puzzle.solution.length <= 4) return 'intermediate';
    return 'advanced';
  }

  getCurrentPuzzle(): Puzzle | null {
    return this.currentPuzzle;
  }

  getCurrentMoveIndex(): number {
    return this.currentMoveIndex;
  }

  getFeedback(): string {
    return this.feedback;
  }
}