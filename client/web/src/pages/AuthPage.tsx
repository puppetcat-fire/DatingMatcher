import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { login, register } = useAuth();

  const validateForm = (): boolean => {
    setError('');
    
    if (!isLogin && !username.trim()) {
      setError(t('Username is required'));
      return false;
    }
    
    if (!email.trim()) {
      setError(t('Email is required'));
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('Invalid email format'));
      return false;
    }
    
    if (password.length < 8) {
      setError(t('Password must be at least 8 characters'));
      return false;
    }
    
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(t('Password must include letters, numbers, and special characters'));
      return false;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setError(t('Passwords do not match'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">{t('appTitle')}</h1>
        <p className="auth-tagline">{t('Welcome to DatingMatcher - A dating app based on personality matching')}</p>
        <h2 className="auth-subtitle">{isLogin ? t('login') : t('register')}</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">{t('username')}</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('username')}
                disabled={loading}
                className="form-input"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">{t('email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email')}
              disabled={loading}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              disabled={loading}
              className="form-input"
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">{t('Confirm Password')}</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('Confirm Password')}
                disabled={loading}
                className="form-input"
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? t('Loading...') : (isLogin ? t('login') : t('register'))}
          </button>
        </form>
        
        <div className="auth-toggle">
          <p>
            {isLogin ? t('Dont have an account?') : t('Already have an account?')}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="toggle-button"
              disabled={loading}
            >
              {isLogin ? t('register') : t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
