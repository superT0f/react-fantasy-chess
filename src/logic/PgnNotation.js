export default class PgnNotation {
  static getMoveNotation(from, to, piece, captured, isEnPassant = false) {
    if (!piece) return "";
    const pieceType = piece.toLowerCase();
    const columns = 'abcdefgh';
    const fromCol = columns[from % 8];
    const fromRow = 8 - Math.floor(from / 8);
    const toCol = columns[to % 8];
    const toRow = 8 - Math.floor(to / 8);

    let pieceSymbol = '';
    switch (pieceType) {
      case 'r': pieceSymbol = 'R'; break;
      case 'n': pieceSymbol = 'N'; break;
      case 'b': pieceSymbol = 'B'; break;
      case 'q': pieceSymbol = 'Q'; break;
      case 'k': pieceSymbol = 'K'; break;
    }

    const captureSymbol = captured ? 'x' : '';
    const enPassantSuffix = isEnPassant ? ' e.p.' : '';
    
    if (pieceType === 'p') {
      return `${toCol}${toRow}`;
    }
    else {
      return `${pieceSymbol}${fromCol}${fromRow}${captureSymbol}${toCol}${toRow}${enPassantSuffix}`;
    }

  }
}