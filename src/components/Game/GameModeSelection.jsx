import { useState } from 'react';

export function GameModeSelection({ onStartNewGame }) {
  const [aiDifficulty, setAiDifficulty] = useState('easy');

  return (
    <div className="mode-selection">
      <h2>Select Game Mode</h2>
      <div className="mode-options">
        <button onClick={() => onStartNewGame('ai')}>Play vs AI</button>
        <button onClick={() => onStartNewGame('pvp')}>locale two players</button>
      </div>
      <div className="ai-difficulty">
        <h3>Select AI Difficulty</h3>
        <select
          value={aiDifficulty}
          onChange={(e) => setAiDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  );
}