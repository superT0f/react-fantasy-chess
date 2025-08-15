import React from 'react';
import { useTheme } from '../context/ThemeContext';

const EntityUI = ({ entity }) => {
  const { theme } = useTheme();

  if (!entity) return null;

  const color = entity === entity.toUpperCase() ? 'w' : 'b';
  const entityType = entity.toLowerCase();
  const entityMap = {
    'p': 'pawn',
    'r': 'rook',
    'n': 'knight',
    'b': 'bishop',
    'q': 'queen',
    'k': 'king'
  };

  const imageName = `${color}_${entityMap[entityType]}`;

  try {
    const image = require(`../assets/themes/${theme}/${imageName}.png`);
    return <img src={image} alt={entity} className="chess-entity" />;
  } catch (e) {
    console.error(`Image not found: ${imageName} in theme ${theme}`);
    return entity;
  }
};

export default EntityUI;