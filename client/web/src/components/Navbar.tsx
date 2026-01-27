import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          Romantic Oracle Raven
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                {t('home')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/questions" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                {t('questions')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/matches" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                {t('matches')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                {t('profile')}
              </NavLink>
            </li>
          </ul>

          <div className="navbar-actions">
            <div className="language-switcher">
              <button 
                className={`lang-btn ${i18n.language === 'zh' ? 'active' : ''}`} 
                onClick={() => handleLanguageChange('zh')}
              >
                CN
              </button>
              <span className="divider">/</span>
              <button 
                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`} 
                onClick={() => handleLanguageChange('en')}
              >
                EN
              </button>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              {t('logout')}
            </button>
          </div>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
