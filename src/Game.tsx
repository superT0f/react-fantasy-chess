import { useState, useEffect, useCallback } from 'react';
import { Board } from './Board';
import { PromotionModal } from './components/Game/PromotionModal'
import { VictoryMessage } from './components/Game/VictoryMessage';
import { GameModeSelection } from './components/Game/GameModeSelection';
import { MoveHistory } from './components/Game/MoveHistory';
import { useChessTimer } from './hooks/useChessTimer';
import { useAIController } from './logic/AIController';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Graveyard } from './components/Graveyard';
import { Logger } from './utils/Logger';
import { PuzzleGameComponent } from './components/Game/PuzzleGame';
import PuzzleGame from './logic/PuzzleGame';
import chessEngine from './logic/chessEngine';
import { WHITE, Chess, BLACK, Move, Piece, PieceSymbol, Square, Color } from 'chess.js';
import config from './config';
import { LastMove, Players } from './types/chess';
import { AuthModal } from './components/Auth/AuthModal';
import { UserData } from './types/user';

import './assets/auth.css';
import Burger from './components/Burger';
import UserMenu from './components/UserMenu';
import { Cookie } from './utils/Cookie';

export default function Game() {
  const urlParams = new URLSearchParams(window.location.search);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  const handleAuthSuccess = (user: UserData) => {
    Logger.debug('Authenticated user:', user);
    setUser(user);
    setShowAuthModal(false);

    // Store user in localStorage as backup
    localStorage.setItem('user', JSON.stringify(user));
  };
  const [roomId, setRoomId] = useState(urlParams.get('room'));
  const chess: Chess = chessEngine.getChess();
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
  const [userRooms, setUserRooms] = useState<any[]>([]);

  // Add this function to fetch user rooms
  const fetchUserRooms = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${config.apiUrl}/user/rooms/${user.id}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setUserRooms(data);
    } catch (error) {
      console.error('Error fetching user rooms:', error);
    }
  };

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/validate_session`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.valid && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        setUser(null);
      }
    };

    validateSession();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserRooms();
    }
  }, [user]);

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);

        // Validate the stored session with the server
        // validateSessionWithServer();
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const {
    timeLeft,
    startTimer,
    stopTimers,
    switchPlayer,
    formatTime,
    resetTimer,
    currentPlayer: timerPlayer // Rename to avoid conflict
  } = useChessTimer(600);

  const [onlinePlayers, setOnlinePlayers] = useState<Players>({
    [WHITE]: 'White',
    [BLACK]: 'Black'
  });

  const [capturedByWhite, setCapturedByWhite] = useState<PieceSymbol[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<PieceSymbol[]>([]);
  const updateCaptured = (
    piece_type: PieceSymbol,
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

  const createOnlineGame = (choosenColor: Color) => {
    const newRoomId = generateRoomId();
    // Send initial game state to the server
    const players = (choosenColor === WHITE) ? {
      [WHITE]: user?.username || 'You', [BLACK]: 'Waiting for player'
    } : {
      [WHITE]: 'Waiting for player', [BLACK]: user?.username || 'You'
    };
    const gameState = {
      fen: chess.fen(),
      player: [choosenColor],
      history: chess.history(),
      players: players
    };
    try {
      fetch(`${config.apiUrl}/game/${newRoomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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


  const joinOnlineGame = (roomId: string) => {
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
  const onTimeout = useCallback(() => {
    if (gameStatus !== 'playing') return;

    const winner = (chess.turn() === WHITE) ? 'BLACK' : 'WHITE';
    setGameStatus('timeout');
    setWinner(winner);
    stopTimers();
  }, [chess, gameStatus, stopTimers]);
  const fetchOnlineGameState = useCallback(async () => {
    try {
      if (chess.isGameOver()) {
        return;
      }

      const roomId = (new URLSearchParams(window.location.search)).get('room');
      if (!roomId) return;

      const response = await fetch(`${config.apiUrl}/game/${roomId}`, {
        credentials: 'include',
      });
      const data = await response.json();

      // Store current state before update
      const currentHistoryLength = chess.history().length;
      const currentTurn = chess.turn();

      // Update game state from server
      if (data.fen && data.fen !== chess.fen()) {
        chess.load(data.fen);
      }

      // Check if it's a new move from opponent
      if (data.history && data.history.length > currentHistoryLength) {
        // History changed, meaning opponent made a move
        setCapturedByWhite(data.capturedByWhite || []);
        setCapturedByBlack(data.capturedByBlack || []);

        // Update player usernames if available
        if (data.players) {
          setOnlinePlayers(data.players);
        }

        // Switch timer to current player
        const newPlayer = chess.turn();
        if (newPlayer !== currentTurn) {
          switchPlayer(newPlayer, onTimeout);
        }

        setGameStatus('playing');
      }

    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  }, [chess, switchPlayer, onTimeout]);

  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return () => {
      // Cleanup polling interval on component unmount
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);
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
        aiColor      :${aiColor}
        timerPlayer  :${timerPlayer}`);

    stopTimers();
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
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      // Fetch initial game state from server
      if (roomId) {
        const response = await fetch(`${config.apiUrl}/game/${roomId}`,
          { credentials: 'include', }
        );
        const data: {
          fen?: string;
          history?: Move[];
          players?: Players
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
        if (data.players) {
          setOnlinePlayers(data.players);

        }
        const interval = setInterval(fetchOnlineGameState, 3500);
        setPollInterval(interval);
      }

      // Set up polling every 3.5 seconds to fetch game state
      setInterval(fetchOnlineGameState, 3500);
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
    if (gameMode === 'online') {
      const roomId = new URLSearchParams(window.location.search).get('room');
      if (roomId) {
        // Check if it's actually this player's turn
        const isPlayerTurn = (chess.turn() === WHITE && onlinePlayers[WHITE] === user?.username) ||
          (chess.turn() === BLACK && onlinePlayers[BLACK] === user?.username);

        if (!isPlayerTurn) {
          Logger.debug("Not your turn!");
          return false;
        }
      }
    }
    if (move.captured) {
      updateCaptured(move.captured);
    }
    setLastMove({
      from: move.from,
      to: move.to,
      piece: chess.get(move.from) as Piece,
      captured: move.captured,
      notation: move.san
    });
    if (chess.isCheckmate()) {
      // side to move is checkmated : looser
      const winner = (chess.turn() === WHITE) ? 'BLACK' : 'WHITE';
      stopTimers();
      setWinner(winner);
      setGameStatus('checkmate');
      return true;
    }
    if (chess.isStalemate()) {
      stopTimers();
      setGameStatus('stalemate');
      return true;
    }

    // timer switch
    // const newPlayer = (chess.turn() === WHITE) ? BLACK : WHITE;
    const newPlayer = chess.turn();
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
  const autoRotate = (gameMode === 'pvp');
  const handleLogout = async () => {
    try {
      await fetch(`${config.apiUrl}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all client-side storage
      setUser(null);
      localStorage.removeItem('user');
      Cookie.clearRememberMe();
      setShowAuthModal(true);
    }
  }; const shareUrl = `${window.location.href}`;

  const blackUsername = (gameMode === 'online') ? onlinePlayers[BLACK] : undefined;
  const whiteUsername = (gameMode === 'online') ? onlinePlayers[WHITE] : undefined;
  return (
    <ThemeProvider>
      <div className="top-menu-container">
        {user ? (
          <UserMenu user={user} onLogout={handleLogout} />
        ) : (
          <Burger setShowAuthModal={setShowAuthModal} />
        )}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </div>
      <div className={`game theme-${localStorage.getItem('chessTheme') || theme}`}>
        {!gameMode && !puzzleMode ? (
          <GameModeSelection
            onStartNewGame={startNewGame}
            onStartPuzzle={() => setPuzzleMode(true)}
            userRooms={userRooms}
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
                  autoRotate={autoRotate}
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
                    username={blackUsername}
                  />
                  <Graveyard
                    captured={capturedByWhite}
                    player={WHITE}
                    timeLeft={timeLeft}
                    formatTime={formatTime}
                    graveDiff={graveDiff.white > 0 ? graveDiff.white : 0}
                    active={!chess.isGameOver && chess.turn() === WHITE}
                    username={whiteUsername}
                  />
                </div>
                <div className="game-board">
                  <Board
                    autoRotate={autoRotate}
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