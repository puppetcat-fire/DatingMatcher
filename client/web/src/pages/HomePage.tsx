import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatches } from '../services/matchService';
import { getAnswerStats } from '../services/authService';
import { Match } from '../types';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [answerStats, setAnswerStats] = useState<{
    dailyAnswerCount: number;
    remainingFreeAnswers: number;
    lastAnswerDate: string;
    isPremiumUser: boolean;
    totalAnswerCount: number;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      if (authState.token) {
        try {
          setLoading(true);
          const data = await getMatches(authState.token);
          // Get Top 5 matches
          setMatches(data.slice(0, 5));
          const stats = await getAnswerStats(authState.token);
          setAnswerStats(stats);
          setError(null);
        } catch (err) {
          setError(t('Failed to load matches'));
          console.error('Error fetching matches:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMatches();
  }, [authState.token, t]);

  const handleMatchCardClick = (userId: string) => {
    navigate(`/matches/${userId}`);
  };

  return (
    <div className="home-dashboard">
      <section className="dashboard-welcome">
        <h1>{t('Welcome, {{username}}', { username: authState.user?.username || '' })}</h1>
        <p className="subtitle">{t('Welcome to DatingMatcher - A dating app based on personality matching')}</p>
      </section>

      <div className="dashboard-content">
        <section className="daily-questions-section">
          <div className="daily-questions-card">
            <div className="daily-questions-text">
              <h3>{answerStats?.isPremiumUser ? t('Premium unlimited questions') : t('Daily Free Questions')}</h3>
              {answerStats ? (
                <>
                  <p>
                    {t('Today answer progress', {
                      count: answerStats.dailyAnswerCount,
                      limit: answerStats.isPremiumUser ? 15 : 5,
                    })}
                  </p>
                  <p>
                    {t('Remaining free answers today', {
                      remaining: answerStats.remainingFreeAnswers,
                    })}
                  </p>
                </>
              ) : (
                <p>{t('Loading...')}</p>
              )}
            </div>
            <button
              className="primary-button"
              onClick={() =>
                navigate('/questions', {
                  state: { autoRandom: true }
                })
              }
              disabled={
                answerStats !== null &&
                answerStats.remainingFreeAnswers === 0
              }
            >
              {answerStats && answerStats.remainingFreeAnswers === 0
                ? t('Daily limit reached message')
                : t('Start Today Questions')}
            </button>
          </div>
        </section>
        
        <section className="matches-section">
          <div className="section-header">
            <h3>{t('Your Top Matches')}</h3>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/matches')}
            >
              {t('View All Matches')}
            </button>
          </div>
          
          {loading ? (
            <div className="section-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : matches.length > 0 ? (
            <div className="match-cards">
              {matches.map((match) => (
                <div 
                  key={match.userId} 
                  className={`match-card match-type-${match.matchType}`}
                  onClick={() => handleMatchCardClick(match.userId)}
                >
                  <div className="match-avatar">
                    {match.profile?.avatar ? (
                      <img src={match.profile.avatar} alt={match.username} />
                    ) : (
                      <div className="default-avatar">
                        {match.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="match-info">
                    <h4>{match.username}</h4>
                    <div className="match-basic-info">
                      <span>{match.profile?.age} {t('years old')}</span>
                      <span className={`match-type match-type-${match.matchType}`}>
                        {t(match.matchType)}
                      </span>
                    </div>
                    <div className="match-score">
                      <span className="score-label">{t('matchScore')}:</span>
                      <span className="score-value">{Math.round(match.compatibilityScore * 100)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-matches">
              <p>{t('No matches found')}</p>
              <p>{t('Complete your profile and answer more questions to get better matches')}</p>
            </div>
          )}
        </section>
        
        <section className="quick-nav">
          <h3>Quick Navigation</h3>
          <div className="nav-cards">
            <div className="nav-card" onClick={() => navigate('/questions')}>
              <h4>{t('questions')}</h4>
              <p>{t('Answer questions to build your profile')}</p>
            </div>
            <div className="nav-card" onClick={() => navigate('/matches')}>
              <h4>{t('matches')}</h4>
              <p>{t('View your personality matches')}</p>
            </div>
            <div className="nav-card" onClick={() => navigate('/profile')}>
              <h4>{t('profile')}</h4>
              <p>{t('Manage your personal profile')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
