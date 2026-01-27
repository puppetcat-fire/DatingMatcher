import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MatchDetail } from '../types';
import { getMatchDetails } from '../services/matchService';
import ScenarioSimulator from '../components/ScenarioSimulator';

const MatchDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [matchDetail, setMatchDetail] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!userId) {
      navigate('/matches');
      return;
    }

    const loadMatchDetail = async () => {
      if (!authState.token) {
        navigate('/auth');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await getMatchDetails(authState.token, userId);
        setMatchDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('Failed to load match details'));
      } finally {
        setLoading(false);
      }
    };

    loadMatchDetail();
  }, [userId, authState.token, navigate, t]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!matchDetail) {
    return <div className="error-message">{t('Match not found')}</div>;
  }

  const { matchedUser, scores, matchReason, matchType, canViewConflictInsights, premiumConflictInsights, clusterPrediction } = matchDetail;

  return (
    <div className="match-detail-page">
      <header className="page-header">
        <div className="header-buttons">
          <button 
            className="back-button"
            onClick={() => navigate('/')}
            style={{ marginRight: '10px' }}
          >
            ← {t('Back to Home')}
          </button>
          <button className="back-button" onClick={() => navigate('/matches')}>
            ← {t('Back to Matches')}
          </button>
        </div>
        <h1>{t('Match Details')}</h1>
      </header>

      <main className="match-detail-main">
        <section className="match-summary">
          <div className="match-user-info">
            <h2>{matchedUser.profile?.name || matchedUser.username}</h2>
            <p>
              {matchedUser.profile?.age !== undefined && (
                <span>
                  {matchedUser.profile.age} {t('years old')}
                </span>
              )}
              {matchedUser.profile?.location && (
                <span className="match-location"> · {matchedUser.profile.location}</span>
              )}
            </p>
          </div>

          <div className="match-scores">
            <div className="score-item">
              <span className="score-label">{t('Match Score')}:</span>
              <span className="score-value">
                {Math.round(scores.compatibilityScore * 100)}
              </span>
            </div>
            <div className="score-item">
              <span className="score-label">{t('similarity')}:</span>
              <span className="score-value">
                {Math.round(scores.similarityScore * 100)}%
              </span>
            </div>
            <div className="score-item">
              <span className="score-label">{t('complementarity')}:</span>
              <span className="score-value">
                {Math.round(scores.complementarityScore * 100)}%
              </span>
            </div>
            <div className="score-item">
              <span className="score-label">{t('conflict')}:</span>
              <span className="score-value">
                {Math.round(scores.conflictScore * 100)}%
              </span>
            </div>
          </div>
        </section>

        <section className="match-reason-section">
          <h2>{t('Match Reason')}</h2>
          <p className="match-type-text">
            {t(matchType)}
          </p>
          <p>{matchReason}</p>
        </section>

        {clusterPrediction && (
           <section className="cluster-prediction-section" style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f0f4ff', borderRadius: '8px', border: '1px solid #d0d7de' }}>
             <h2 style={{ fontSize: '1.2em', marginBottom: '10px' }}>
               <span role="img" aria-label="ai">🤖</span> {t('AI Scenario Forecast')}
             </h2>
             <p style={{ fontWeight: 'bold', color: clusterPrediction.score > 70 ? '#2e7d32' : clusterPrediction.score < 40 ? '#c62828' : '#f57f17' }}>
                {t('Predicted Compatibility')}: {clusterPrediction.score}/100
             </p>
             <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
               "{clusterPrediction.analysis}"
             </p>
             <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
               * {t('Based on user cluster analysis (Pre-calculated)')}
             </p>
           </section>
        )}

        {canViewConflictInsights && premiumConflictInsights && (
          <section className="conflict-insights-section">
            <h2>{t('Potential Conflict Scenarios')}</h2>
            <p>
              {t('Conflict Score Label')}: {Math.round(premiumConflictInsights.conflictScore * 100)}%
            </p>
            {premiumConflictInsights.hasPotentialConflicts &&
            premiumConflictInsights.conflictQuestions.length > 0 ? (
              <ul className="conflict-question-list">
                {premiumConflictInsights.conflictQuestions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            ) : (
              <p>{t('No obvious conflict scenarios')}</p>
            )}
          </section>
        )}

        <section className="scenario-section">
          <ScenarioSimulator 
            userId={matchedUser._id} 
            isPremium={!!authState.user?.isPremiumUser}
            token={authState.token}
          />
        </section>

      </main>
    </div>
  );
};

export default MatchDetailPage;
