import { Entity } from './Entity';

// Exportez toutes vos classes logiques
export { default as Pawn } from './Pawn';
export { default as Bishop } from './pieces/Bishop';
export { default as King } from './pieces/King';
export { default as Knight } from './pieces/Knight';
export { default as Queen } from './pieces/Queen';
export { default as Rook } from './pieces/Rook';

export { Entity }; // Exportez Entity séparément

export { default as PgnNotation } from './PgnNotation';