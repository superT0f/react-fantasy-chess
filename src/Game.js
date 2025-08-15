import { useState, useEffect, useRef } from 'react';
import { Board } from './Board';
import PgnNotation from './logic/PgnNotation';
import Entity from './logic/Entity';
import ChessAI from './logic/AI';
import { ThemeProvider } from './context/ThemeContext';
import ThemeSelector from './components/ThemeSelector';
import { useTheme } from './context/ThemeContext';

export default function Game() {
  const { theme } = useTheme();
  const [gameMode, setGameMode] = useState(null); // null, 'pvp', 'ai'
  const [aiDifficulty, setAiDifficulty] = useState('easy'); // 'easy', 'medium', 'hard'
  const [isAiThinking, setIsAiThinking] = useState(false);

  const initialChessBoard = [
    'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
    'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
    'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
  ];

  const [history, setHistory] = useState([{
    squares: initialChessBoard,
    pgn: 'Start'
  }]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'checkmate', 'stalemate', 'timeout'
  const [winner, setWinner] = useState(null); // 'white', 'black', null

  const [currentMove, setCurrentMove] = useState(0);
  const [lastMove, setLastMove] = useState(null);
  const current = history[currentMove];
  const currentSquares = current ? current.squares : initialChessBoard;
  const [currentPlayer, setCurrentPlayer] = useState('white'); // 'white' or 'black'

  const [timeLeft, setTimeLeft] = useState({
    white: 600, // 10 min
    black: 600
  });
  const timerRef = useRef(null);

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const isTimeout = timeLeft.white <= 0 || timeLeft.black <= 0;
    if (isTimeout) {
      setGameStatus('timeout');
      setWinner(timeLeft.white <= 0 ? 'black' : 'white');
      clearInterval(timerRef.current);
    }
  }, [timeLeft, gameStatus]);


  // short timer warning
  useEffect(() => {
    if (timeLeft.white <= 30 || timeLeft.black <= 30) {
      const whiteTimer = document.querySelector('.timer.white');
      const blackTimer = document.querySelector('.timer.black');

      if (timeLeft.white <= 30) whiteTimer?.classList.add('low-time');
      if (timeLeft.black <= 30) blackTimer?.classList.add('low-time');
    }
  }, [timeLeft]);

  function startTimer() {
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (gameStatus !== 'playing') return null;
      setTimeLeft(prev => {
        const newTime = { ...prev };
        newTime[currentPlayer] = Math.max(0, newTime[currentPlayer] - 1);

        if (newTime[currentPlayer] <= 0) {
          clearInterval(timerRef.current);
          alert(`${currentPlayer === 'white' ? 'Black' : 'White'} wins by time!`);
        }

        return newTime;
      });
    }, 1000);
  }
  startTimer();
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function VictoryMessage() {
    if (gameStatus === 'playing') return null;

    const messages = {
      checkmate: `${winner === 'white' ? 'WHITE' : 'BLACK'} WINS BY CHECKMATE!`,
      stalemate: "STALEMATE! IT'S A DRAW!",
      timeout: `${winner === 'white' ? 'WHITE' : 'BLACK'} WINS BY TIMEOUT!`
    };

    const emojis = {
      white: '🎉👑🎉',
      black: '🎉🏴🎉',
      draw: '🤝'
    };

    return (
      <div className="victory-message">
        <div className="victory-text">
          {messages[gameStatus]}
        </div>
        <div className="victory-emoji">
          {gameStatus === 'stalemate' ? emojis.draw : emojis[winner]}
        </div>
        <button
          className="play-again"
          onClick={() => window.location.reload()}
        >
          PLAY AGAIN
        </button>
      </div>
    );
  }

  function handleMove(nextSquares,
    from, to, captured, isEnPassant, isFromIA = false) {
    const opponent = currentPlayer === 'white' ? 'black' : 'white';

    if (gameStatus !== 'playing') return false;
    const isOpponentInCheckmate = Entity.isCheckmate(nextSquares, opponent);
    const isOpponentInStalemate = !isOpponentInCheckmate &&
      Entity.isStalemate(nextSquares, opponent);

    if (isOpponentInCheckmate) {
      setGameStatus('checkmate');
      setWinner(currentPlayer);
      clearInterval(timerRef.current);
      return true;
    }

    if (isOpponentInStalemate) {
      setGameStatus('stalemate');
      clearInterval(timerRef.current);
      return true;
    }


    const pgn = PgnNotation.getMoveNotation(
      from,
      to,
      currentSquares[from],
      captured,
      isEnPassant,
      Entity.isCheck(nextSquares, currentPlayer),
      isOpponentInCheckmate
    );

    const nextHistory = [...history.slice(0, currentMove + 1), {
      squares: nextSquares,
      pgn: pgn
    }];

    if (isEnPassant) {
      nextHistory[captured] = '';
    }
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setLastMove({
      from: PgnNotation.idxToXY(from),
      to: PgnNotation.idxToXY(to),
      piece: currentSquares[from],
      captured,
      notation: pgn
    });
    if (gameMode === 'ai' &&
      gameStatus === 'playing' &&
      !isFromIA) {
      setIsAiThinking(true);
      setTimeout(() => {
        if (makeAiMove(nextSquares)) {
          setCurrentPlayer('white'); // Set to white after AI move

        }
        setIsAiThinking(false);
      }, 1500);
    } else {
      setCurrentPlayer('black'); // Switch to opponent's turn
    }
    return true;
  }

  function makeAiMove(currentSquares) {
    if (!currentSquares || gameStatus !== 'playing') return;
    const move = ChessAI.getRandomMove(moves, currentSquares, 'black');
    if (move) {
      const { from, to } = move;

      const entityChar = currentSquares[from];
      const entity = Entity.fromChar(entityChar, from, currentSquares);
      const captured = currentSquares[to] !== '' ? currentSquares[to] : null;
      const isEnPassant = entity.isEnPassant(to);

      const newSquares = [...currentSquares];
      newSquares[to] = newSquares[from];
      newSquares[from] = '';

      if (isEnPassant) {
        newSquares[(to + 8)] = '';
      }
      handleMove(
        newSquares,
        from,
        to,
        captured,
        isEnPassant,
        true // Indicate that this move is from AI
      )
      setCurrentPlayer('white'); // Set to white after AI move
      return true;
    }
  }

  function startNewGame(mode) {
    setGameMode(mode);
    setGameStatus('playing');
    setHistory([{
      squares: initialChessBoard,
      pgn: 'Start'
    }]);
    setCurrentMove(0);
    setTimeLeft({
      white: 600,
      black: 600
    });
    setWinner(null);
  }

  function GameModeSelection() {
    if (gameMode !== null) return null;

    return (
      <div className="mode-selection">
        <h2>Select Game Mode</h2>
        <div className="mode-options">
          <button onClick={() => startNewGame('ai')}>
            Play vs AI
          </button>
          <button onClick={() => startNewGame('pvp')}>
            locale two players
          </button>
        </div>
        {gameMode === 'ai' && (
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
        )}
      </div>
    );
  }



  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = [];
  if (history.length >= 2)
    for (let i = 1; i < history.length; i += 2) {
      const whiteMove = history[i];
      const blackMove = history[i + 1];

      let description = ``;
      if (whiteMove && whiteMove.pgn && whiteMove.pgn !== 'Start') {
        description += ` ${whiteMove.pgn}`;
      }
      if (blackMove && blackMove.pgn) {
        description += `   -   ${blackMove.pgn}`;
      }

      moves.push(
        <li key={i}>
          <button className="move" onClick={() => jumpTo(i)}>{description}</button>
        </li>
      );
    }
  return (
    <ThemeProvider>
      <div className={`game theme-${localStorage.getItem('chessTheme') || theme}`}>
        {gameMode === null ? (
          <GameModeSelection />
        ) : (
          <>
            <VictoryMessage />
            {isAiThinking && <div className="ai-thinking">AI is thinking...</div>}

            <div className="board-container">
              <div className="timer-container">
                <div className={`timer white ${currentPlayer === 'white' ? 'active' : ''}`}>
                  White: {formatTime(timeLeft.white)}
                </div>
                <div className={`timer black ${currentPlayer === 'black' ? 'active' : ''}`}>
                  Black: {formatTime(timeLeft.black)}
                </div>
                <ThemeSelector />
              </div>
              <div className="game-content">
                <div className="game-board">
                  <Board
                    currentPlayer={currentPlayer}
                    squares={currentSquares}
                    onMove={handleMove}
                    lastMove={lastMove}
                    gameStatus={gameStatus}
                  />
                </div>
                <div className="game-info">
                  <ol>{moves}</ol>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
