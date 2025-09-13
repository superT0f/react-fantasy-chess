import { useState, useEffect } from 'react';

export function OnlineLobby({ onJoin, onCreate, onExit }) {
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const useRoomIdFromURL = (setRoomId, searchParams = new URLSearchParams(window.location.search)) => {
    useEffect(() => {
      const roomIdFromURL = searchParams.get('room');

      if (roomIdFromURL) {
        setRoomId(roomIdFromURL);
      }
    }, [setRoomId]);
  };

  useRoomIdFromURL(setRoomId);
  if (roomId.length > 6) {
    roomId = roomId.toUpperCase();
    onCreate();
  }
  return (
    <div className="online-lobby">
      <div className="lobby-header">
        <h2>Online Multiplayer</h2>

      </div>

      <div className="lobby-options">
        <div className="lobby-option join-option">
          {/* <h3>Join an Existing Game</h3>
          <p>Enter a game code to join your friend's game</p> */}
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