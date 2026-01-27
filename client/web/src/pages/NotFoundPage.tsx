import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="not-found-page" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px',
      color: 'var(--dark-gray)'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>404</h1>
      <h2 style={{ marginBottom: '2rem' }}>{t('Page Not Found')}</h2>
      <p style={{ marginBottom: '2rem' }}>{t('The page you are looking for does not exist.')}</p>
      <button 
        className="primary-button"
        onClick={() => navigate('/')}
      >
        {t('Back to Home')}
      </button>
    </div>
  );
};

export default NotFoundPage;
