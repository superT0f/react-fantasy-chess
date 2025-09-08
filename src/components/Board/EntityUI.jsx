import { WHITE, Piece } from 'chess.js';
import React from 'react';

const EntityUI = ({ /**
                    * @type {Piece | null} */
                  piece }) => {
  const theme = localStorage.getItem('chessTheme') || 'classic';
  if (!piece) return null;

  const color = piece.color;
  const entityMap = {
    'p': 'pawn',
    'r': 'rook',
    'n': 'knight',
    'b': 'bishop',
    'q': 'queen',
    'k': 'king'
  };

  const imageName = `${color}_${entityMap[piece.type]}`;

  try {
    const image = require(`../../assets/themes/${theme}/${imageName}.png`);
    return <img src={image} alt={imageName} className="chess-entity" />;
  } catch (e) {
    console.error(`Image not found: ${imageName}.png in theme ${theme}`);
    return imageName;
  }
};

export default EntityUI;