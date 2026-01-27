import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Match } from '../types';
import { getMatches } from '../services/matchService';

/**
 * 匹配列表页面 (MatchesPage)
 * 
 * 功能描述：
 * 1. 展示基于算法推荐的用户匹配列表。
 * 2. 筛选功能：支持按匹配类型（相似、互补、合适、冲突）筛选。
 * 3. 排序功能：支持按匹配分数、相似度、互补度、冲突度排序。
 * 4. 导航优化：顶部提供“返回主页”按钮。
 */
const MatchesPage: React.FC = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('compatibilityScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedMatchType, setSelectedMatchType] = useState<string>('all');
  
  const matchTypes = ['all', 'similar', 'complementary', 'suitable', 'conflicting'];
  
  useEffect(() => {
    const loadMatches = async () => {
      if (!authState.token) {
        navigate('/auth');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        const matchesData = await getMatches(authState.token);
        setMatches(matchesData);
        setFilteredMatches(matchesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('Failed to load matches'));
      } finally {
        setLoading(false);
      }
    };
    
    loadMatches();
  }, [authState.token, navigate, t]);
  
  // Filter and sort matches
  useEffect(() => {
    let result = [...matches];
    
    // Filter by match type
    if (selectedMatchType !== 'all') {
      result = result.filter(match => match.matchType === selectedMatchType);
    }
    
    // Sort matches
    result.sort((a, b) => {
      let aVal = a[sortBy as keyof Match] as number;
      let bVal = b[sortBy as keyof Match] as number;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
    
    setFilteredMatches(result);
  }, [matches, selectedMatchType, sortBy, sortOrder]);
  
  const handleMatchClick = (match: Match) => {
    navigate(`/matches/${match.userId}`);
  };
  
  const getMatchTypeColor = (matchType: string): string => {
    switch (matchType) {
      case 'similar':
        return '#2196F3'; // Blue
      case 'complementary':
        return '#4CAF50'; // Green
      case 'suitable':
        return '#9C27B0'; // Purple
      case 'conflicting':
        return '#F44336'; // Red
      default:
        return '#666'; // Gray
    }
  };
  
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
  
  return (
    <div className="matches-page">
      <main className="matches-main">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← {t('Back to Home')}
          </button>
          <h1>{t('matches')}</h1>
          <div className="match-stats">
            <h2>{t('Total Matches')}: {filteredMatches.length}</h2>
          </div>
        </div>

        <div className="filter-section">
          <div className="sort-filter">
            <label>{t('Sort By')}:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="compatibilityScore">{t('Match Score')}</option>
              <option value="similarityScore">{t('Similarity')}</option>
              <option value="complementarityScore">{t('Complementarity')}</option>
              <option value="conflictScore">{t('Conflict')}</option>
            </select>
            <button 
              className="sort-order-button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          
          <div className="type-filter">
            <label>{t('Match Type')}:</label>
            <select
              value={selectedMatchType}
              onChange={(e) => setSelectedMatchType(e.target.value)}
              className="type-select"
            >
              <option value="all">{t('All')}</option>
              {matchTypes.filter(type => type !== 'all').map(type => (
                <option key={type} value={type}>{t(type)}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="matches-grid">
          {filteredMatches.length === 0 ? (
            <div className="no-matches">{t('No matches found')}</div>
          ) : (
            filteredMatches.map(match => (
              <div 
                key={match.userId} 
                className="match-card"
                onClick={() => handleMatchClick(match)}
              >
                <div className="match-avatar">
                  {match.profile.avatar ? (
                    <img 
                      src={match.profile.avatar} 
                      alt={`${match.username}'s avatar`}
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {match.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="match-info">
                  <div className="match-header">
                    <h3 className="match-name">
                      {match.username}
                      {match.profile.age && <span className="match-age">, {match.profile.age}</span>}
                    </h3>
                    <span 
                      className="match-type-badge" 
                      style={{ backgroundColor: getMatchTypeColor(match.matchType) }}
                    >
                      {t(match.matchType)}
                    </span>
                  </div>
                  
                  <div className="match-score">
                    <span className="score-label">{t('Match Score')}:</span>
                    <span className="score-value">
                      {Math.round(match.compatibilityScore * 100)}%
                    </span>
                  </div>

                  {match.clusterPrediction && (
                    <div className="cluster-prediction-badge" style={{ marginTop: '8px', padding: '4px 8px', backgroundColor: '#f0f4ff', borderRadius: '4px', fontSize: '0.85em', color: '#444', border: '1px solid #d0d7de' }}>
                      <span role="img" aria-label="ai">🤖</span> 
                      <strong>AI Forecast: </strong>
                      {match.clusterPrediction.score > 70 ? 'High Compatibility' : match.clusterPrediction.score < 40 ? 'Potential Conflict' : 'Moderate'}
                    </div>
                  )}
                  
                  <div className="score-details">
                    <div className="score-item">
                      <span className="score-name">{t('Similarity')}:</span>
                      <span className="score-bar">
                        <div 
                          className="score-fill similarity" 
                          style={{ width: `${match.similarityScore * 100}%` }}
                        ></div>
                      </span>
                      <span className="score-percent">{Math.round(match.similarityScore * 100)}%</span>
                    </div>
                    
                    <div className="score-item">
                      <span className="score-name">{t('Complementarity')}:</span>
                      <span className="score-bar">
                        <div 
                          className="score-fill complementarity" 
                          style={{ width: `${match.complementarityScore * 100}%` }}
                        ></div>
                      </span>
                      <span className="score-percent">{Math.round(match.complementarityScore * 100)}%</span>
                    </div>
                    
                    <div className="score-item">
                      <span className="score-name">{t('Conflict')}:</span>
                      <span className="score-bar">
                        <div 
                          className="score-fill conflict" 
                          style={{ width: `${match.conflictScore * 100}%` }}
                        ></div>
                      </span>
                      <span className="score-percent">{Math.round(match.conflictScore * 100)}%</span>
                    </div>
                  </div>
                  
                  {match.profile.location && (
                    <div className="match-location">
                      🌍 {match.profile.location}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default MatchesPage;
