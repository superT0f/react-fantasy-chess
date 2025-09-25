import { PieceSymbol } from "chess.js";

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type Square = string; // e.g., "e2", "e4"

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType;
  captured?: PieceType;
}

export interface LastMove {
  from: Square;
  to: Square;
  piece?: Piece;
  captured?: PieceSymbol | undefined;
  notation?: string;
}
export interface GameState {
  fen: string;
  history: string[];
  players: PieceColor[];
}

export interface GameMode {
  type: 'pvp' | 'ai' | 'online' | 'puzzle';
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  aiColor?: PieceColor;
}

export interface TimerState {
  white: number;
  black: number;
}

export interface OnlineGameState {
  fen: string;
  history: string[];
  players: PieceColor[];
  creatorColor: PieceColor;
}