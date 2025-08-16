import { useState, useEffect, useRef } from 'react';
import { Board } from './Board';
import PgnNotation from './logic/PgnNotation';
import Entity from './logic/Entity';
import ChessAI from './logic/AI';
import { ThemeProvider } from './context/ThemeContext';
import ThemeSelector from './components/ThemeSelector';
import { useTheme } from './context/ThemeContext';
import Referee from './logic/Referee';


export default function Game() {
  const { theme } = useTheme();
  const [referee] = useState(new Referee());
  const [gameMode, setGameMode] = useState(null);
  const [aiDifficulty, setAiDifficulty] = useState('easy');
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
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ white: 600, black: 600 });
  const timerRef = useRef(null);

  const currentSquares = referee.getCurrentBoard() || initialChessBoard;

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
    if (gameStatus !== 'playing') return null;
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
        newTime[referee.getCurrentPlayer()] = Math.max(0, newTime[referee.getCurrentPlayer()] - 1);

        if (newTime[referee.getCurrentPlayer()] <= 0) {
          clearInterval(timerRef.current);
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

  function handleMove(nextSquares, from, to, captured, isEnPassant, isFromIA = false) {
    if (gameStatus !== 'playing') return false;
    const opponent = referee.getCurrentPlayer() === 'white' ? 'black' : 'white';

    const isOpponentInCheckmate = Entity.isCheckmate(nextSquares, opponent);
    const isOpponentInStalemate = !isOpponentInCheckmate &&
      Entity.isStalemate(nextSquares, opponent);

    if (isOpponentInCheckmate) {
      setGameStatus('checkmate');
      setWinner(referee.getCurrentPlayer());
      clearInterval(timerRef.current);
    } else if (isOpponentInStalemate) {
      setGameStatus('stalemate');
      clearInterval(timerRef.current);
    }

    referee.recordMove(
      nextSquares,
      from,
      to,
      currentSquares[from],
      captured,
      isEnPassant,
      Entity.isCheck(nextSquares, referee.getCurrentPlayer()),
      isOpponentInCheckmate
    );

    setLastMove({
      from: PgnNotation.idxToXY(from),
      to: PgnNotation.idxToXY(to),
      piece: currentSquares[from],
      captured,
      notation: referee.getLastMove().pgn
    });

    if (gameMode === 'ai' && !isFromIA) {
      setIsAiThinking(true);
      setTimeout(() => {
        makeAiMove(nextSquares);
        setIsAiThinking(false);
      }, 1500);
    }

    return true;
  }

  function makeAiMove(currentSquares) {
    if (!currentSquares || gameStatus !== 'playing') return;

    const move = ChessAI.getRandomMove(referee.getHistory(), currentSquares, 'black');
    if (move) {
      const { from, to, enPassantTarget } = move;

      let state = {
        selectedSquare: from,
        validMoves: referee.getAllValidMoves(from, currentSquares, enPassantTarget),
        enPassantTarget,
        isOpponentPiece: false,
        lastMovedSquare: null
      };

      const result = referee.handleSquareClick(
        to,
        state,
        currentSquares,
        'black',
        enPassantTarget
      );

      if (result.moveData) {
        const { from, to, isEnPassant } = result.moveData;
        const newSquares = [...currentSquares];
        const captured = newSquares[to] !== '' ? newSquares[to] : null;

        newSquares[to] = newSquares[from];
        newSquares[from] = '';

        if (isEnPassant) {
          newSquares[to + (referee.getCurrentPlayer() === 'white' ? -8 : 8)] = '';
        }

        handleMove(
          newSquares,
          from,
          to,
          captured,
          isEnPassant,
          true
        );
      }
    }
  }

  function startNewGame(mode) {
    referee.reset();
    setGameMode(mode);
    setGameStatus('playing');
    setTimeLeft({ white: 600, black: 600 });
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

  const moves = [];
  const history = referee.getHistory();
  if (history.length >= 2) {
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
          <button className="move" onClick={() => (referee.jumpTo(i))}>
            {description}
          </button>
        </li>
      );
    }
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
                <div className={`timer white ${referee.getCurrentPlayer() === 'white' ? 'active' : ''}`}>
                  White: {formatTime(timeLeft.white)}
                </div>
                <div className={`timer black ${referee.getCurrentPlayer() === 'black' ? 'active' : ''}`}>
                  Black: {formatTime(timeLeft.black)}
                </div>
                <ThemeSelector />
              </div>
              <div className="game-content">
                <div className="game-board">
                  <Board
                    onMove={handleMove}
                    lastMove={lastMove}
                    gameStatus={gameStatus}
                    referee={referee}
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
