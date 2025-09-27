import { BLACK, WHITE } from 'chess.js';
import { useState, useEffect } from 'react';
import EntityUI from '../Board/EntityUI';

interface OnlineLobbyProps {
  userRooms: any[];
  onJoin: (roomId: string) => void;
  onCreate: (creatorColor: typeof WHITE | typeof BLACK) => void;
  onExit: () => void;
}

export function OnlineLobby({ userRooms, onJoin, onCreate, onExit }: OnlineLobbyProps) {
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creatorColor, setCreatorColor] = useState<'white' | 'black'>('white');

  const useRoomIdFromURL = (setRoomId: (roomId: string) => void) => {
    useEffect(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const roomIdFromURL = searchParams.get('room');

      if (roomIdFromURL) {
        setRoomId(roomIdFromURL);
      }
    }, [setRoomId]);
  };

  useRoomIdFromURL(setRoomId);
  return (
    <div className="online-lobby">
      <div className="lobby-header">
        <h2>Online</h2>
      </div>
      <div className="divider"> ➛ Create new game as</div>
      <div className="color-selection">
        
        <div className="color-options">
          <label>
            <input
              type="radio"
              name="creatorColor"
              value="white"
              checked={creatorColor === 'white'}
              onChange={(e) => setCreatorColor(e.target.value as 'white' | 'black')}
            />
            <span className="color-option white-option">
              <EntityUI piece={{color: WHITE, type: 'k'}} />
              white
            </span>
          </label>
          <label>
            <input
              type="radio"
              name="creatorColor"
              value="black"
              checked={creatorColor === 'black'}
              onChange={(e) => setCreatorColor(e.target.value as 'white' | 'black')}
            />
            <span className="color-option black-option">
              <EntityUI piece={{color: BLACK, type: 'k'}} />
              black
            </span>
          </label>
        </div>
        
        <button
          className="lobby-button start-btn primary"
          onClick={() => {
            setIsCreating(true);
            onCreate(creatorColor === 'white' ? WHITE : BLACK);
          }}
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : `Create and play as ${creatorColor}`}
        </button>
      </div>
      <div className="divider"> ➛ Join a party</div>
      <div className="join-section">
        <div className="join-form">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            maxLength={6}
            className="room-input"
          />
          <button
            className="start-btn lobby-button"
            onClick={() => onJoin(roomId)}
            disabled={roomId.length < 4}
          >
            join
          </button>
        </div>
      </div>
      {userRooms.length > 0 && (
        <div className="user-rooms">
          <div className="divider"> ➛ Continue your current games :</div>
          {userRooms.map(room => (
            <div key={room.room_id} className="room-item">
              
              <button className="start-btn lobby-button" onClick={() => onJoin(room.room_id)}>
                Join 
              </button>
              <span>: {room.room_id}</span>
            </div>
          ))}
        </div>
      )}

      <button className="back-btn" onClick={onExit}>
        &larr; Back
      </button>

      <div className="lobby-footer">
        <p>Share party code to your friend</p>
      </div>
    </div>
  );
}