import { useState, useEffect, useRef } from 'react';
import { Board } from './Board';
import { VictoryMessage } from './components/Game/VictoryMessage';
import { GameModeSelection } from './components/Game/GameModeSelection';
import { MoveHistory } from './components/Game/MoveHistory';
import { TimerDisplay } from './components/TimerDisplay';
import { useChessTimer } from './hooks/useChessTimer';
import { useAIController } from './components/Game/AIController';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Referee from './logic/Referee';
import Entity from './logic/Entity';
import PgnNotation from './logic/PgnNotation';

export default function Game() {
  const { theme } = useTheme();
  const [referee] = useState(new Referee());
  const [gameMode, setGameMode] = useState(null);
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const { isAiThinking, setIsAiThinking, makeAiMove } = useAIController({ gameMode, aiDifficulty, referee, gameStatus });
  const {
    timeLeft,
    currentPlayer: timerPlayer,
    startTimer,
    switchPlayer,
    formatTime,
    resetTimer
  } = useChessTimer(600);

  function startNewGame(mode) {
    referee.reset();
    resetTimer();
    startTimer(referee.getCurrentPlayer(), onTimeout);
    setGameMode(mode);
    setGameStatus('playing');
    setWinner(null);
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
      captured,
      isEnPassant,
      Entity.isCheck(nextSquares, referee.getCurrentPlayer()),
      isOpponentInCheckmate
    );

    setLastMove({
      from: PgnNotation.idxToXY(from),
      to: PgnNotation.idxToXY(to),
      piece: referee.getSquare(from),
      captured,
      notation: referee.getLastMove().pgn
    });

    if (gameMode === 'ai' && !isFromIA) {
      setIsAiThinking(true);
      setTimeout(() => {
        makeAiMove(nextSquares, handleMove);
        setIsAiThinking(false);
      }, 500);
    }

    switchPlayer(opponent, onTimeout);
    return true;
  }


  const onTimeout = () => {
    setGameStatus('timeout');
    setWinner(referee.getCurrentPlayer() === 'white' ? 'black' : 'white');
    clearInterval(timerRef.current);
  };

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

  return (
    <ThemeProvider>
      <div className={`game theme-${localStorage.getItem('chessTheme') || theme}`}>
        {gameMode === null ? (
          <GameModeSelection onStartNewGame={startNewGame} />
        ) : (
          <>
            <VictoryMessage
              gameStatus={gameStatus}
              winner={winner}
              onPlayAgain={() => window.location.reload()}
            />

            {isAiThinking && <div className="ai-thinking">AI is thinking...</div>}

            <div className="board-container">
              <TimerDisplay
                timeLeft={timeLeft}
                formatTime={formatTime}
                currentPlayer={referee.getCurrentPlayer()}
              />

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
                  <MoveHistory
                    history={referee.getHistory()}
                    onJumpToMove={(i) => referee.jumpTo(i)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}