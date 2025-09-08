import { useState, useEffect } from 'react';
import EntityUI from '../Board/EntityUI';
import { Piece } from 'chess.js';
export function PromotionModal({ color, onSelect, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  /**
   * @type {Piece[]}
   */
  const promotionPieces = [
    {type : 'q', color : color},
    {type : 'r', color : color},
    {type : 'b', color : color},
    {type : 'n', color : color}];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSelection = (piece) => {
    onSelect(piece);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getSquarePosition = () => {
    const row = 4;
    const col = 4;
    return {
      top: `${row * 12.5}%`,
      left: `${col * 12.5}%`
    };
  };

  if (!isVisible) return null;

  return (
    <div className="promotion-modal-overlay" onClick={onClose}>
      <div 
        className="promotion-modal"
        style={getSquarePosition()}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Promote to:</h3>
        <div className="promotion-options">
          {promotionPieces.map(piece => (
            <button
              key={piece}
              className="promotion-option"
              onClick={() => handleSelection(piece)}
            >
              <EntityUI piece={piece} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}