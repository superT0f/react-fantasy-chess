export default class MoveData {
  constructor({
    from,
    to,
    squares,
    captured = null,
    isEnPassant = false,
    isCheck = false,
    isCheckmate = false,
    isCastle = false,
    isFromIA = false
  }) {
    this.from = from;
    this.to = to;
    this.squares = squares;
    this.captured = captured;
    this.isEnPassant = isEnPassant;
    this.isCheck = isCheck;
    this.isCheckmate = isCheckmate;
    this.isCastle = isCastle;
    this.isFromIA = isFromIA;
  }

 
  copy(updates = {}) {
    return new MoveData({ ...this, ...updates });
  }
}