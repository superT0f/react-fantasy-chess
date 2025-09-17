import { Square } from 'chess.js';
import { PgnNotation } from '../logic';
import chessEngine from '../logic/chessEngine';
import { Logger, LogLevel } from './Logger';

export class ConsoleBoard {
  static log(chess = chessEngine.getChess(), title = 'Chess Board') {
    if (!Logger.shouldLog(LogLevel.INFO)) return;

    const pieceSymbols: Record<'r' | 'n' | 'b' | 'q' | 'k' | 'p' | 'R' | 'N' | 'B' | 'Q' | 'K' | 'P' | '', string> = {
      'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
      'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
      '': '·'
    };
    const colors = {
      darkSquare: '\x1b[48;5;137m',
      lightSquare: '\x1b[48;5;223m',
      blackPiece: '\x1b[30m',
      whitePiece: '\x1b[97m',
      reset: '\x1b[0m',
      border: '\x1b[38;5;94m'
    };

    Logger.debug(`\n🎯 ${title}`);
    Logger.debugNoSlug(`${colors.border}  ╔═a══b══c══d══e══f══g═══h══╗${colors.reset}\n`);
    for (let row = 0; row < 8; row++) {
      let rowStr = `${colors.border}${8 - row} ║ ${colors.reset}`;

      for (let col = 0; col < 8; col++) {
        const index = row * 8 + col;
        const square = PgnNotation.idxToXY(index) as Square;
        const piece = chess.get(square) || '';
        const pieceColor = piece && (piece.color === 'w' ? colors.whitePiece : colors.blackPiece) || colors.reset;
        const symbol = pieceSymbols[(piece as keyof typeof pieceSymbols)] || pieceSymbols[''];   
        const bgColor = (chess.squareColor(square) === "dark") ? colors.darkSquare : colors.lightSquare;

        rowStr += `${bgColor}${pieceColor} ${symbol} ${colors.reset}`;
      }

      Logger.debugNoSlug(rowStr + `${colors.border} ║ ${8 - row}${colors.reset}`);
    }
    Logger.debugNoSlug(`${colors.border}  ╚═a══b══c══d══e══f══g═══h══╝${colors.reset}\n`);
  }
}