import { useState, useEffect, useRef, useCallback } from 'react';
import { Board } from './Board';
import { PromotionModal } from './components/Game/PromotionModal'
import { VictoryMessage } from './components/Game/VictoryMessage';
import { GameModeSelection } from './components/Game/GameModeSelection';
import { MoveHistory } from './components/Game/MoveHistory';
import { useChessTimer } from './hooks/useChessTimer';
import { useAIController } from './logic/AIController';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Graveyard } from './components/Graveyard';
import { Logger  } from './utils/Logger';
import { PuzzleGameComponent } from './components/Game/PuzzleGame';
import PuzzleGame from './logic/PuzzleGame';
import chessEngine from './logic/chessEngine';
import { WHITE, Chess, BLACK, Move, Piece, PieceSymbol, Square } from 'chess.js';
import config from './config';
import { LastMove } from './types/chess';


export default function Game() {
  const urlParams = new URLSearchParams(window.location.search);
  const [roomId, setRoomId] = useState(urlParams.get('room'));
  const chess:Chess = chessEngine.getChess();
  const { theme } = useTheme();
  const [gameMode, setGameMode] = useState<'pvp' | 'ai' | 'online' | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [aiColor, setAiColor] = useState(BLACK);
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState<"BLACK" | "WHITE" | null>(null);

  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [isAiAggressive, setIsAiAggressive] = useState(true);
  const [promotionSquares, setPromotionSquares] = useState<{ from: Square; to: Square } | null>(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  const [puzzleMode, setPuzzleMode] = useState(false);
  const [puzzleGame] = useState(new PuzzleGame());
  const [feedback, setFeedback] = useState('');
  const { isAiThinking, setIsAiThinking, makeAiMove } = useAIController({
    gameMode,
    aiDifficulty,
    isAiAggressive,
    gameStatus
  });

  const {
    timeLeft,
    startTimer,
    stoptTimers,
    switchPlayer,
    formatTime,
    resetTimer
  } = useChessTimer(600);

  const [capturedByWhite, setCapturedByWhite] = useState<PieceSymbol[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<PieceSymbol[]>([]);
  const updateCaptured = (
    piece_type : PieceSymbol,
  ) => {
    if (!piece_type) return;
    if (chess.turn() === WHITE) {
      setCapturedByWhite(prev => [...prev, piece_type]);
    } else {
      setCapturedByBlack(prev => [...prev, piece_type]);
    }
  };
  const computeGraveDiff = () => {
    const eValues = {
      'p': 1, 'P': 1,
      'n': 3, 'N': 3,
      'b': 3, 'B': 3,
      'r': 5, 'R': 5,
      'q': 10, 'Q': 10
    };

    const validPieceSymbols = ['p', 'P', 'n', 'N', 'b', 'B', 'r', 'R', 'q', 'Q'] as const;
    type ValidPieceSymbol = typeof validPieceSymbols[number];

    const whiteScore = capturedByWhite.reduce(
      (sum, piece) =>
        validPieceSymbols.includes(piece as ValidPieceSymbol)
          ? sum + eValues[piece as ValidPieceSymbol]
          : sum,
      0
    );
    const blackScore = capturedByBlack.reduce(
      (sum, piece) =>
        validPieceSymbols.includes(piece as ValidPieceSymbol)
          ? sum + eValues[piece as ValidPieceSymbol]
          : sum,
      0
    );

    return {
      white: whiteScore - blackScore,
      black: blackScore - whiteScore
    };
  };

  const createOnlineGame = () => {
    const newRoomId = generateRoomId();
    // Send initial game state to the server
    const gameState = {
      fen: chess.fen(),
      player: [WHITE],
      history: chess.history()
    };
    try {
      fetch(`${config.apiUrl}?roomId=${newRoomId}&newgame=1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: newRoomId,
          gameState
        }),
      });
    } catch (error) {
      console.error('Error sending game state:', error);
    }
    joinOnlineGame(newRoomId);
  };

  
  const joinOnlineGame = (roomId:string) => {
    roomId = roomId.toUpperCase();
    // Update Browser URL with room ID
    window.history.pushState({}, '', `?room=${roomId}`);
    setRoomId(roomId);
    startNewGame('online');
  };

  // Add this function to generate room IDs
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Add this to check for room ID in URL on component mount
  useEffect(() => {
    if (roomId) {
      startNewGame('online'); // Default to white when joining
    }
  }, []);


  const fetchOnlineGameState = useCallback(async () => {
    try {
      const roomId = (new URLSearchParams(window.location.search)).get('room');
      if (!roomId) return;
      const response = await fetch(`${config.apiUrl}?roomId=${roomId}&fetchOnlineGameState=1`);
      const data = await response.json();

      // Update game state from server
      if (data.fen && data.fen !== chess.fen()) {
        chess.load(data.fen);
      }

      if (data.history && JSON.stringify(data.history) !== JSON.stringify(chess.history())) {
        // History changed, meaning opponent made a move
        setCapturedByWhite(data.capturedByWhite || []);
        setCapturedByBlack(data.capturedByBlack || []);

        if (data.history.length > chess.history().length) {
          // It's our turn now
          setGameStatus('playing');
          const newPlayer = chess.turn();
          switchPlayer(newPlayer, onTimeout);
        }
      }

      // Check if opponent has joined
      if (data.players && data.players.length === 2) {
        setGameStatus('playing');
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  }, []);


  async function startNewGame(
    mode: 'pvp' | 'ai' | 'online',
    difficulty: 'easy' | 'medium' | 'hard' = 'easy',
    aggressive: boolean = true,
    aiColor: typeof WHITE | typeof BLACK = BLACK
  ): Promise<void> {
    Logger.debug(`startNewGame =
        mode         :${mode},
        difficulty   :${difficulty}, 
        aggressive   :${aggressive}, 
        aiColor      :${aiColor}`);
    resetTimer();
    startTimer(WHITE, onTimeout);
    setGameMode(mode);
    setGameStatus('playing');
    setWinner(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    if (mode === 'pvp') {
      chess.reset();
    }

    if (mode === 'ai') {
      setAiDifficulty(difficulty);
      setAiColor(aiColor);
      setIsAiAggressive(aggressive);
      if (aiColor === WHITE) {
        setIsAiThinking(true);
        setTimeout(() => {
          makeAiMove(handleMove, setIsAiThinking);
        }, 1500);
      }
    }

    if (mode === 'online') {
      chessEngine.mode = 'online';
      // Fetch initial game state from server
      if (roomId) {
        const response = await fetch(`${config.apiUrl}?roomId=${roomId}&startNewGame=1`);
        const data: {
          fen?: string;
          history?: Move[];
        } = await response.json();
        // Update game state from server
        if (data.fen && data.fen !== chess.fen()) {
          chess.load(data.fen);
        }
        if (data.history) {
          if (Array.isArray(data.history)) {
            chess.reset();
            data.history.forEach((move: any) => {
              // If move is a string, use it directly; if it's an object, use its SAN or UCI notation
              if (typeof move === 'string') {
                chess.move(move);
              } else if (move.san) {
                chess.move(move.san);
              } else if (move.from && move.to) {
                chess.move({ from: move.from, to: move.to, promotion: move.promotion });
              }
            });
          }
        }
      }

      // Set up polling every 1.5 seconds to fetch game state
      setInterval(fetchOnlineGameState, 1500) as unknown as number;
      //setPollInterval(interval);
    }
  }

  const handlePromotion = (from: any, to: any) => {
    setPromotionSquares({ from: from, to: to });
    setShowPromotionModal(true);
  };

  function handleMove(move: Move) {
    if (puzzleMode) {
      handlePuzzleMove(move);
      return true;
    }

    if (gameStatus !== 'playing') {
      Logger.debug('Game not in playing state, ignoring move');
      return false;
    }

    if (move.captured) {
      updateCaptured(move.captured);
    }

    const lastMoveData = move;
    const lastMoveNotation = lastMoveData ? lastMoveData.san : '';

    setLastMove({
      from: move.from,
      to: move.to,
      piece: chess.get(move.from) as Piece,
      captured: move.captured,
      notation: lastMoveNotation
    });
    if (chess.isCheckmate()) {
      // side to move is checkmated : looser
      const winner = (chess.turn() === WHITE) ? 'BLACK' : 'WHITE';
      stoptTimers();
      setWinner(winner);
      setGameStatus('checkmate');
      return true;
    }
    if (chess.isStalemate()) {
      stoptTimers();
      setGameStatus('stalemate');
      return true;
    }

    // timer switch
    const newPlayer = (chess.turn() === WHITE) ? BLACK : WHITE;
    switchPlayer(newPlayer, onTimeout);

    // trigger ai move after player
    const isAITurn = (aiColor === chess.turn());
    if (gameMode === 'ai' && isAITurn) {
      setIsAiThinking(true);
      setTimeout(() => {
        makeAiMove(handleMove, setIsAiThinking);

      }, 1500);
    }

    return true;
  }


  const handlePuzzleMove = (move: { from: any; to: any; promotion?: any; }) => {
  
      const result = puzzleGame.validateMove(move);
  
      if (result.isValid) {
        // Process the move normally
        handleMove(chess.move({ from: move.from, to: move.to, promotion: move.promotion }));
  
        setFeedback(result.feedback);
        if (result.isComplete) {
          // Puzzle completed, you might want to show a celebration
          Logger.debug('Puzzle completed!');
        }
      } else {
        Logger.debug('handlePuzzleMove move not valid!');
      }
    };


  const graveDiff = computeGraveDiff();

  const timerRef = useRef<number | null>(null);

  const onTimeout = () => {
    // side to move is loosing by time
    const winner = (chess.turn() === WHITE) ? 'BLACK' : 'WHITE';
    setGameStatus('timeout');
    setWinner(winner);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current as number);
    }
  };

  // const [pollInterval, setPollInterval] =useState<number | null>(null);
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const isTimeout = timeLeft[WHITE] <= 0 || timeLeft[BLACK] <= 0;
    if (isTimeout) {
      setGameStatus('timeout');
      setWinner(timeLeft[WHITE] <= 0 ? 'BLACK' : 'WHITE');
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    }




  }, [timeLeft, gameStatus]);

  const shareUrl = `${window.location.origin}?room=${roomId}`;

  return (
    <ThemeProvider>
      <div className={`game theme-${localStorage.getItem('chessTheme') || theme}`}>
        {!gameMode && !puzzleMode ? (
          <GameModeSelection
            onStartNewGame={startNewGame}
            onStartPuzzle={() => setPuzzleMode(true)}

            joinOnlineGame={joinOnlineGame}
            createOnlineGame={createOnlineGame}
          />
        ) : puzzleMode ? (
          <>
            <PuzzleGameComponent
              puzzleGame={puzzleGame}
              feedback={feedback}
              onExit={() => {
                setPuzzleMode(false);
                setGameMode(null);
              }}
            />
            <div className="board-container">
              <div className="game-board">
                <Board
                  onMove={handlePuzzleMove}
                  onPromotion={handlePromotion}
                  lastMove={lastMove}
                  gameStatus={gameStatus}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <VictoryMessage
              gameStatus={gameStatus}
              winner={winner}
              onPlayAgain={() => window.location.reload()}
            />

            {showPromotionModal && (
              <PromotionModal
                color={chess.turn()}
                onSelect={(piece: { type: any; }) => {
                  if (promotionSquares) {
                    handleMove(chessEngine.move(
                      {
                        from: promotionSquares.from,
                        to: promotionSquares.to,
                        promotion: piece?.type
                      }
                    ));
                  }
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


            {gameMode === 'online' && roomId && (
              <div className="online-info">

                <p>Share this URL (Room:{roomId})</p>
                <div >
                  <input className="share-url" type="text" value={shareUrl} readOnly />
                  <button className="share-btn" id="copybtn" onClick={() => {
                    
                    navigator.clipboard.writeText(shareUrl)
                    const copyBtn = document.getElementById('copybtn');
                    if (copyBtn && !copyBtn.className.includes('copied'))
                      copyBtn.className += ' copied';
                  }
                  }>
                    Copy
                  </button>
                </div>
              </div>)}



            <div className="board-container">
              <div className="game-content">
                <div className="graveyard-contant">
                  <Graveyard
                    captured={capturedByBlack}
                    player={BLACK}
                    timeLeft={timeLeft}
                    formatTime={formatTime}
                    graveDiff={graveDiff.black > 0 ? graveDiff.black : 0}
                    active={!chess.isGameOver && chess.turn() === BLACK}
                  />
                  <Graveyard
                    captured={capturedByWhite}
                    player={WHITE}
                    timeLeft={timeLeft}
                    formatTime={formatTime}
                    graveDiff={graveDiff.white > 0 ? graveDiff.white : 0}
                    active={!chess.isGameOver && chess.turn() === WHITE}
                  />
                </div>
                <div className="game-board">
                  <Board
                    onMove={puzzleMode ? handlePuzzleMove : handleMove}
                    onPromotion={handlePromotion}
                    lastMove={lastMove}
                    gameStatus={gameStatus}
                  />
                </div>
                <div className="game-info">
                  <MoveHistory
                    history={chess.history()}
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