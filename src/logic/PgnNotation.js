export default class PgnNotation {

  static getLetter(idx) {
    const columns = 'abcdefgh';
    const col = columns[idx % 8];

    return col;
  }

  static idxToXY(idx) {
    return PgnNotation.getLetter(idx) + PgnNotation.getNumber(idx);
  }

  static getNumber(idx) {
    const row = 8 - Math.floor(idx / 8);

    return row;
  }
  static getMoveNotation(from, to, entity, captured,
    isEnPassant = false,
    isCheck = false,
    isCheckmate = false,
    isCastle = false,
    isPromotion = false,
    promotionPiece = null) {
    if (!entity) return " ".repeat(10);

    const entityType = entity.toLowerCase();
    const columns = 'abcdefgh';
    const fromCol = columns[from % 8];
    const fromRow = 8 - Math.floor(from / 8);
    const toCol = columns[to % 8];
    const toRow = 8 - Math.floor(to / 8);

    // Unicode
    const entitySymbols = {
      'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '',
      'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': ''
    };

    let notation = '';

    if (entityType !== 'p') {
      notation += entitySymbols[entity] || entity.toUpperCase();
    }

    if (captured && entityType !== 'p') {
      notation += fromCol;
    }

    notation += captured ? 'x' : '';
    notation += toCol + toRow;

    if (isPromotion && promotionPiece) {
      const promotionSymbols = {
        'q': '=Q', 'r': '=R', 'b': '=B', 'n': '=N',
        'Q': '=Q', 'R': '=R', 'B': '=B', 'N': '=N'
      };
      notation += promotionSymbols[promotionPiece] || '=Q';
    }

    if (isEnPassant) notation += ' e.p.';
    if (isCheckmate) notation += '#';
    else if (isCheck) notation += '+';
    if (isCastle) {
      notation = (toCol === 'c') ? 'O-O-O' : 'O-O';
    }

    return notation.padEnd(10, ' ');
  }
  static xyToIdx(xy) {
    const col = xy.charAt(0).toLowerCase();
    const row = parseInt(xy.charAt(1));
    const cols = 'abcdefgh';
    const x = cols.indexOf(col);
    const y = 8 - row;
    return y * 8 + x;
  }
}