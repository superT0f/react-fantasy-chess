import { useState, useEffect } from 'react';

interface OnlineLobbyProps {
  userRooms:any[];
  onJoin: (roomId: string) => void;
  onCreate: () => void;
  onExit: () => void;
}

export function OnlineLobby({ userRooms, onJoin, onCreate, onExit }: OnlineLobbyProps) {
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
  
  if (roomId.length > 6) {
    const upperRoomId = roomId.toUpperCase();
    setRoomId(upperRoomId);
    setIsCreating(true);
    onCreate();
  }

  return (
    <div className="online-lobby">
      <div className="lobby-header">
        <h2>Online Multiplayer</h2>
      </div>
      {userRooms.length > 0 && (
        <div className="user-rooms">
          <h3>Your Existing Rooms</h3>
          {userRooms.map(room => (
            <div key={room.room_id} className="room-item">
              <span>Room: {room.room_id}</span>
              <button onClick={() => onJoin(room.room_id)}>
                Join
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="lobby-options">
        <div className="lobby-option join-option">
          <div className="join-form">
            <div className="divider">
                <input
                  type="text"
                  placeholder="Enter Game Code"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="room-input"
                />
            </div>

            <button
              className="start-btn lobby-button"
              onClick={() => onJoin(roomId)}
              disabled={roomId.length < 4}
            >
              Join Game
            </button>
            <button
              className="lobby-button start-btn primary"
              onClick={onCreate}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Game'}
            </button>
            <button className="back-btn" onClick={onExit}>
              &larr; Back
            </button>
          </div>
        </div>
      </div>

      <div className="lobby-footer">
        <p>Share the game code with your opponent to play together</p>
      </div>
    </div>
  );
}