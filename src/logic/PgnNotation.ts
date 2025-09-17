import { Square } from "chess.js";

export default class PgnNotation {

  static getLetter(idx:number) {
    const columns = 'abcdefgh';
    const col = columns[idx % 8];

    return col;
  }

  static idxToXY(idx:number):Square {
    return PgnNotation.getLetter(idx) + PgnNotation.getNumber(idx) as Square;
  }

  static getNumber(idx:number) {
    const row = 8 - Math.floor(idx / 8);

    return row;
  }

  static xyToIdx(xy:Square):number {
    const col = xy.charAt(0).toLowerCase();
    const row = parseInt(xy.charAt(1));
    const cols = 'abcdefgh';
    const x = cols.indexOf(col);
    const y = 8 - row;
    return y * 8 + x;
  }
}