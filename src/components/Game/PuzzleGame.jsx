import { useState, useEffect } from 'react';
import PuzzleGame from '../../logic/PuzzleGame';

export function PuzzleGameComponent({ puzzleGame, onExit, feedback }) {
    const [currentPuzzle, setCurrentPuzzle] = useState(null);
    const [progress, setProgress] = useState(puzzleGame.getProgress());
    const [showHint, setShowHint] = useState(false);
    const [puzzleId, setPuzzleId] = useState(null); // Add state to track puzzle ID

    useEffect(() => {
        // Load first puzzle on component mount
        const firstPuzzle = puzzleGame.getNextPuzzle();
        if (firstPuzzle) {
            loadPuzzle(firstPuzzle.id);
        }
    }, []);

    // Add useEffect to watch for puzzle changes
    useEffect(() => {
        if (puzzleId) {
            const puzzle = puzzleGame.loadPuzzle(puzzleId);
            setCurrentPuzzle(puzzle);
            setShowHint(false);
            // Force board refresh by updating state
            setProgress({...puzzleGame.getProgress()});
        }
    }, [puzzleId, puzzleGame]);

    const loadPuzzle = (puzzleId) => {
        setPuzzleId(puzzleId); // Update state to trigger useEffect
    };

    const handleHint = () => {
        const hint = puzzleGame.getHint();
        if (hint) {
            setShowHint(true);
            setTimeout(() => setShowHint(false), 5000);
        }
    };

    const handleNextPuzzle = () => {
        const nextPuzzle = puzzleGame.getNextPuzzle();
        if (nextPuzzle) {
            loadPuzzle(nextPuzzle.id);
        } else {
            console.log('All puzzles completed!');
        }
    };

    if (!currentPuzzle) {
        return (
            <div className="puzzle-container">
                <div className="puzzle-loading">Loading puzzle...</div>
            </div>
        );
    }

    const difficulty = puzzleGame.getPuzzleDifficulty(currentPuzzle);

    return (
        <div className="puzzle-container">
            <div className="puzzle-header">
                <h2>Puzzle #{currentPuzzle.id}</h2>
                <span className={`difficulty-badge ${difficulty}`}>
                    {difficulty.toUpperCase()}
                </span>
            </div>

            <div className="puzzle-info">
                <p className="puzzle-description">{currentPuzzle.description}</p>
                <p className="puzzle-progress">
                    Move {puzzleGame.currentMoveIndex + 1} of {currentPuzzle.solution.length}
                </p>
            </div>

            {showHint && (
                <div className="puzzle-hint">
                    💡 Hint: {puzzleGame.getHint()?.description}
                </div>
            )}

            <div className="puzzle-feedback">
                {feedback}
            </div>

            <div className="puzzle-controls">
                <button onClick={handleHint} className="puzzle-btn hint-btn">
                    💡 Hint
                </button>
                <button onClick={handleNextPuzzle} className="puzzle-btn next-btn">
                    ➡️ Next
                </button>
                <button onClick={onExit} className="puzzle-btn exit-btn">
                    🚪 Exit
                </button>
            </div>

            <div className="puzzle-progress-bar">
                <div className="progress-stats">
                    Solved: {progress.solved} | Failed: {progress.failed} | Remaining: {progress.remaining}
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress.percentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}