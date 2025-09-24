import { useState } from 'react';
import { PuzzleSolver } from './PuzzleSolver';
import { BLACK, WHITE } from 'chess.js';
import EntityUI from '../Board/EntityUI';
import { OnlineLobby } from './OnlineLobby';


export function GameModeSelection({ userRooms, onStartNewGame, onStartPuzzle, joinOnlineGame,
   createOnlineGame }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [isAggressive, setIsAggressive] = useState(true);
  const [aiColor, setAiColor] = useState(BLACK);

  const handleModeSelect = (mode) => {
    if (mode === 'pvp' || mode === 'puzzle')
      onStartNewGame(mode);
    else
      setSelectedMode(mode);
  };

  const startAIGame = () => {
    onStartNewGame('ai', aiDifficulty, isAggressive, aiColor);
  };

  const backToModeSelection = () => {
    setSelectedMode(null);
  };

  if (selectedMode === 'ai') {
    return (
      <div className="mode-selection">
        <h2>Configure AI Opponent</h2>
        <div className="ai-config-section">
          <h3>Color</h3>
          <div className="difficulty-options">
            <button
              className={`difficulty-btn ai-color-picker ${aiColor === BLACK ? 'selected' : ''}`}
              onClick={() => setAiColor(BLACK)}
            >
              <EntityUI piece={{ color: 'b', type: 'p' }} />
              <span className="difficulty-desc">Play as black</span>
            </button>
            <button
              className={`difficulty-btn ai-color-picker ${aiColor === WHITE ? 'selected' : ''}`}
              onClick={() => setAiColor(WHITE)}
            >
              <EntityUI piece={{ color: 'w', type: 'q' }} />
              <span className="difficulty-desc">Play as white</span>
            </button>
          </div>
        </div>
        <div className="ai-config-section">
          <h3>Difficulty</h3>
          <div className="difficulty-options">
            <button
              className={`difficulty-btn ${aiDifficulty === 'easy' ? 'selected' : ''}`}
              onClick={() => setAiDifficulty('easy')}
            >
              ♟️ Easy
              {/* <span className="difficulty-desc">Good for beginners</span> */}
            </button>

            <button
              className={`difficulty-btn ${aiDifficulty === 'medium' ? 'selected' : ''}`}
              onClick={() => setAiDifficulty('medium')}
            >
              ♞ Medium
              {/* <span className="difficulty-desc">Balanced challenge</span> */}
            </button>

            <button
              className={`difficulty-btn ${aiDifficulty === 'hard' ? 'selected' : ''}`}
              onClick={() => setAiDifficulty('hard')}
            >
              ♛ Hard
              {/* <span className="difficulty-desc">For experienced players</span> */}
            </button>
          </div>
        </div>

        <div className="ai-config-section">
          <h3 ><i class="ai-thinking" >Personality</i></h3>
          <div className="personality-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isAggressive}
                onChange={(e) => setIsAggressive(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                {isAggressive ? '⚔️ Aggressive' : '🛡️ Defensive'}
              </span>
            </label>
            <p className="personality-desc">
              {isAggressive
                ? 'Prefers attacking moves and captures'
                : 'Focuses on defense and position'
              }
            </p>
          </div>
        </div>

        <div className="ai-actions">
          <button className="back-btn" onClick={backToModeSelection}>
            ← Back
          </button>
          <button className="start-btn" onClick={startAIGame}>
            Start Game vs AI
          </button>
        </div>

      </div>
    );
  }
  if (selectedMode === 'lobby') {
    return (
      <OnlineLobby
        userRooms={userRooms}
        onJoin={joinOnlineGame}
        onCreate={createOnlineGame}
        onExit={backToModeSelection}
      />
    );
  }

  

  return (
    <div className="mode-selection">
      <h2>Select Game Mode</h2>
      <div className="mode-options">

        <button
          className="mode-btn online-mode"
          onClick={() => setSelectedMode('lobby')}
        >
          <span className="mode-icon">🌐 <span className="mode-title">Online Play</span></span>
          <span className="mode-desc">Play against someone online</span>
        </button>

        <button
          className="mode-btn ai-mode"
          onClick={() => handleModeSelect('ai')}
        >
          <span className="mode-icon">🤖 <span className="mode-title">Play vs AI</span></span>

          <span className="mode-desc">Challenge computer opponent</span>
        </button>
        <button
          className="mode-btn puzzle-mode"
          onClick={onStartPuzzle}
        >
          <span className="mode-icon">🧩 <span className="mode-title">Puzzles</span> </span>

          <span className="mode-desc">Challenge yourself 🙃</span>
        </button><button
          className="mode-btn pvp-mode"
          onClick={() => handleModeSelect('pvp')}
        >
          <span className="mode-icon">👥 <span className="mode-title">Two Players</span></span>

          <span className="mode-desc">Play with a friend locally</span>
        </button>
      </div>
    </div >
  );
}