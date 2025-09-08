import { useState } from 'react';
import PgnNotation from '../../logic/PgnNotation';


export function PuzzleSolver({ onMove, onStartNewGame, isPuzzleMode, puzzleGame}) {
    const [puzzles] = useState(require('../../assets/puzzles.json').puzzles);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [feedback, setFeedback] = useState('');

    const hint = () => {
        if (!currentPuzzle) return;

        const nextMove = currentPuzzle.solution[currentMoveIndex];
        const from = PgnNotation.xyToIdx(nextMove.substring(0, 2));
        const to = PgnNotation.xyToIdx(nextMove.substring(2, 4));

        setFeedback(`Hint: Consider moving from ${nextMove.substring(0, 2)} to ${nextMove.substring(2, 4)}`);
    };

    const exitPuzzle = () => {
        // setIsPuzzleMode(false);
        // setCurrentPuzzle(null);
        // setFeedback('');
        // Reset to normal game
    };

    if (!isPuzzleMode) {
        return (
            <div className="puzzle-selection">
                <h3>Chess Puzzles</h3>
                <div className="puzzle-list">
                    {puzzles.map(puzzle => (
                        <div key={puzzle.id} className="puzzle-item">
                            <button onClick={() => puzzleGame.loadPuzzle(puzzle.id)}>
                                Puzzle #{puzzle.id}
                            </button>
                            <p>{puzzle.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="puzzle-mode">
            <h3>Puzzle #{currentPuzzle.id}</h3>
            <p>{feedback}</p>
            <p>Move {currentMoveIndex + 1} of {currentPuzzle.solution.length}</p>
            <div className="puzzle-controls">
                <button onClick={hint}>Hint</button>
                <button onClick={exitPuzzle}>Exit Puzzle</button>
            </div>
        </div>
    );
}