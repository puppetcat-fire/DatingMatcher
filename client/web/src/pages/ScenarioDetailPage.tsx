import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scenario, ScenarioMatch } from '../types';
import { getScenario, getScenarioMatches } from '../services/scenarioService';

const ScenarioDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { id: scenarioId } = useParams<{ id: string }>();
  
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [matches, setMatches] = useState<ScenarioMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    if (!scenarioId) {
      navigate('/scenarios');
      return;
    }
    
    const loadScenarioAndMatches = async () => {
      if (!authState.token) {
        navigate('/auth');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        const [scenarioData, matchesData] = await Promise.all([
          getScenario(authState.token, scenarioId),
          getScenarioMatches(authState.token, scenarioId)
        ]);
        
        setScenario(scenarioData);
        setMatches(matchesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('Failed to load scenario'));
      } finally {
        setLoading(false);
      }
    };
    
    loadScenarioAndMatches();
  }, [scenarioId, authState.token, navigate, t]);
  
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
  
  if (!scenario) {
    return <div className="error-message">{t('Scenario not found')}</div>;
  }
  
  return (
    <div className="scenario-detail-page">
      <div className="page-header">
        <div className="header-buttons">
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
            style={{ marginRight: '10px' }}
          >
            ← {t('Back to Home')}
          </button>
          <button 
            className="back-button" 
            onClick={() => navigate('/scenarios')}
          >
            ← {t('Back to Scenarios')}
          </button>
        </div>
        <h1>
          {t('current_language') === 'zh' ? scenario.title : scenario.titleEn}
        </h1>
      </div>
      
      <main className="scenario-detail-main">
        <div className="scenario-info">
          <h2>{t('Scenario Description')}</h2>
          <p className="scenario-description">
            {t('current_language') === 'zh' ? scenario.description : scenario.descriptionEn}
          </p>
          <div className="scenario-meta">
            <span className="scenario-type">{t('Type')}: {scenario.type}</span>
          </div>
        </div>
        
        <div className="scenario-matches">
          <h2>{t('Scenario Match Results')}</h2>
          <div className="matches-stats">
            <span>{t('Total Matches')}: {matches.length}</span>
          </div>
          
          <div className="scenario-matches-grid">
            {matches.length === 0 ? (
              <div className="no-matches">{t('No matches found for this scenario')}</div>
            ) : (
              matches.map(match => (
                <div key={match.userId} className="scenario-match-card">
                  <div className="match-header">
                    <h3 className="match-name">
                      {match.name}, {match.age}
                    </h3>
                    <span className="match-score">
                      {Math.round(match.scenarioMatchScore * 100)}%
                    </span>
                  </div>
                  
                  <div className="match-analysis">
                    <h4>{t('Analysis')}</h4>
                    <p>{match.analysis}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScenarioDetailPage;
