import { useState, useEffect } from 'react';
import config from '../../config';
import { UserData } from '../../types/user';
import { Logger } from '../../utils/Logger';
import { Cookie } from '../../utils/Cookie';

interface LoginFormProps {
  onSuccess: (user: UserData) => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember_me: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for remember me token on component mount
  useEffect(() => {
    const checkAutoLogin = async () => {
      const rememberMeToken = Cookie.getRememberMeToken();
      if (rememberMeToken) {
        try {
          setLoading(true);
          const response = await fetch(`${config.apiUrl}/validate_session`, {
            credentials: 'include'
          });
          const data = await response.json();

          if (data.valid && data.user) {
            Logger.debug('Auto-login successful via remember me token');
            onSuccess(data.user);
          } else {
            // Token is invalid, clear it
            Cookie.clearRememberMe();
          }
        } catch (error) {
          console.error('Auto-login failed:', error);
          Cookie.clearRememberMe();
        } finally {
          setLoading(false);
        }
      }
    };

    checkAutoLogin();
  }, [onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${config.apiUrl}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.user) {
        // Store remember me token if requested
        if (formData.remember_me && data.remember_token) {
          Cookie.setRememberMeToken(data.remember_token);
          Cookie.setUserData(data.user);
        } else if (!formData.remember_me) {
          // Clear any existing remember me data if not requested
          Cookie.clearRememberMe();
        }

        Logger.debug('Login successful:', data.user);
        onSuccess(data.user);
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            aria-required="true"
            autoComplete='username'
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            minLength={8}
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="remember_me"
              checked={formData.remember_me}
              onChange={handleChange}
            />
            Remember me for 30 days
          </label>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p>
        Don't have an account?{' '}
        <button 
          type="button" 
          onClick={onSwitchToRegister} 
          className="link-button"
          disabled={loading}
        >
          Register here
        </button>
      </p>
    </div>
  );
}