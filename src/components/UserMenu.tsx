import { useState, useRef, useEffect, MouseEventHandler } from 'react';
import { UserData } from '../types/user';

interface UserMenuProps {
  user: UserData;
  onLogout: () => void;
}

const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const home: MouseEventHandler<HTMLButtonElement> = () => {
    window.location.replace('./');
  };
  return (
    <div className="user-menu-container" ref={menuRef}>
      <div className="user-avatar" onClick={() => setIsOpen(!isOpen)}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.username} />
        ) : (
          <img
            src='https://avatars.githubusercontent.com/u/174439585?v=4'
            alt={user.username}
          />
        )}
      </div>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-info">
            <strong>{user.username}</strong>
            <span>{user.email}</span>
          </div>
          <button onClick={home}  >🏠 Home</button>
          <button                 >👤 Profile</button>
          <button                 >⚙️ Settings</button>
          <button                 >📊 Statistics</button>
          <button                 >🎮 My Games</button>
          <hr />
          <button onClick={onLogout}><i>🚪</i> Logout</button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;