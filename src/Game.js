import { useState, useEffect, useRef } from 'react';
import { Board } from './Board';
import { PromotionModal } from './components/Game/PromotionModal'
import { VictoryMessage } from './components/Game/VictoryMessage';
import { GameModeSelection } from './components/Game/GameModeSelection';
import { MoveHistory } from './components/Game/MoveHistory';
import { TimerDisplay } from './components/TimerDisplay';
import { useChessTimer } from './hooks/useChessTimer';
import { useAIController } from './logic/AIController';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Referee from './logic/Referee';
import Entity from './logic/Entity';
import PgnNotation from './logic/PgnNotation';
import MoveData from './logic/MoveData';
import { Graveyard } from './components/Graveyard';
import Log from './Log';


export default function Game() {
  const { theme } = useTheme();
  const [referee] = useState(new Referee());
  const [gameMode, setGameMode] = useState(null);
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [isAiAggressive, setIsAiAggressive] = useState(true);
  const [promotionSquares, setPromotionSquares] = useState(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  const { isAiThinking, setIsAiThinking, makeAiMove } = useAIController({
    gameMode,
    aiDifficulty,
    isAiAggressive,
    referee,
    gameStatus
  });

  const {
    timeLeft,
    currentPlayer: timerPlayer,
    startTimer,
    switchPlayer,
    formatTime,
    resetTimer
  } = useChessTimer(600);

  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);

  const computeGraveDiff = () => {
    const eValues = {
      'p': 1, 'P': 1,
      'n': 3, 'N': 3,
      'b': 3, 'B': 3,
      'r': 5, 'R': 5,
      'q': 10, 'Q': 10
    };

    const whiteScore = capturedByWhite.reduce((sum, piece) => sum + (eValues[piece] || 0), 0);
    const blackScore = capturedByBlack.reduce((sum, piece) => sum + (eValues[piece] || 0), 0);

    return {
      white: whiteScore - blackScore,
      black: blackScore - whiteScore
    };
  };

  function startNewGame(mode, difficulty = 'easy', aggressive = true) {
    Log.debug(`startNewGame with mode:${mode}, difficulty:${difficulty}, aggressive:${aggressive}`);

    referee.reset();
    resetTimer();
    startTimer(referee.getCurrentPlayer(), onTimeout);
    setGameMode(mode);
    setAiDifficulty(difficulty);
    setIsAiAggressive(aggressive);
    setGameStatus('playing');
    setWinner(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
  }

  const handlePromotion = (from, to) => {
    setPromotionSquares({from:from, to:to});
    setShowPromotionModal(true);
  };

  function handleMove(moveData) {
    Log.debug(`handleMove, 
    from: ${PgnNotation.idxToXY(moveData.from)},
      to: ${PgnNotation.idxToXY(moveData.to)}`);

    if (gameStatus !== 'playing') {
      Log.debug('Game not in playing state, ignoring move');
      return false;
    }

    const opponent = referee.getCurrentPlayer() === 'white' ? 'black' : 'white';
    const { squares, isFromIA } = moveData;
    const isOpponentInCheckmate = Entity.isCheckmate(squares, opponent);
    const isOpponentInStalemate = !isOpponentInCheckmate && referee.isStalemate(squares, opponent);

    if (moveData.captured) {
      if (referee.getCurrentPlayer() === 'white') {
        setCapturedByBlack(prev => [...prev, moveData.captured]);
      } else {
        setCapturedByWhite(prev => [...prev, moveData.captured]);
      }
    }

    if (isOpponentInCheckmate) {
      setGameStatus('checkmate');
      setWinner(referee.getCurrentPlayer());
      clearInterval(timerRef.current);
    } else if (isOpponentInStalemate) {
      setGameStatus('stalemate');
      clearInterval(timerRef.current);
    }

    referee.recordMove(moveData);

    setLastMove({
      from: PgnNotation.idxToXY(moveData.from),
      to: PgnNotation.idxToXY(moveData.to),
      piece: moveData.promotionPiece || referee.getSquare(moveData.from),
      captured: moveData.captured,
      notation: referee.getLastMove().pgn
    });

    const newPlayer = referee.getCurrentPlayer();
    switchPlayer(newPlayer, onTimeout);


    if (gameMode === 'ai' && !isFromIA && newPlayer === 'black') {
      setIsAiThinking(true);
      makeAiMove(squares, handleMove);

      //setTimeout(() => {
      setIsAiThinking(false);
      //}, 500);
    }

    return true;

  }
  const graveDiff = computeGraveDiff();

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

            {showPromotionModal && (
              <PromotionModal
                square={promotionSquares.to}
                color={referee.getCurrentPlayer()}
                onSelect={(piece) => {
                  // Handle promotion selection
                  const moveData = new MoveData({
                    from: promotionSquares.from,
                    to: promotionSquares.to,
                    squares: referee.getCurrentBoard(),
                    isPromotion: true,
                    promotionPiece: piece,
                    isFromIA: false
                  });
                  handleMove(moveData);
                  setShowPromotionModal(false);
                  setPromotionSquares(null);
                }}
                onClose={() => {
                  setShowPromotionModal(false);
                  setPromotionSquares(null);
                }}
              />
            )}

            {isAiThinking && <div className="ai-thinking">AI is thinking...</div>}
            <div className="board-container">
              <div className="game-content">
                <Graveyard
                  captured={capturedByBlack}
                  player="black"
                  graveDiff={graveDiff.black > 0 ? graveDiff.black : 0}
                />
                <div className="game-board">
                  <Board
                    onMove={handleMove}
                    onPromotion={handlePromotion}
                    lastMove={lastMove}
                    gameStatus={gameStatus}
                    referee={referee}
                  />
                </div>

                <Graveyard
                  captured={capturedByWhite}
                  player="white"
                  graveDiff={graveDiff.white > 0 ? graveDiff.white : 0}
                />

                <TimerDisplay
                  timeLeft={timeLeft}
                  formatTime={formatTime}
                  currentPlayer={referee.getCurrentPlayer()}
                />
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