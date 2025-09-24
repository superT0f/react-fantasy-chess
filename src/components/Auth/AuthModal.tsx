import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { UserData } from '../../types/user';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user:UserData) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        {isLogin ? (
          <LoginForm
            onSuccess={onAuthSuccess}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={onAuthSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
}