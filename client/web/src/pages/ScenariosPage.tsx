import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scenario } from '../types';
import { getScenarios } from '../services/scenarioService';

/**
 * 场景列表页面 (ScenariosPage)
 * 
 * 注意：此页面入口已从主导航移除，目前作为内部或高级功能存在。
 * 
 * 功能描述：
 * 1. 展示预设的婚恋交互场景列表。
 * 2. 点击场景可进入详情页查看在该场景下的匹配分析。
 * 3. 导航优化：顶部提供“返回主页”按钮，防止用户误入后迷失。
 */
const ScenariosPage: React.FC = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const loadScenarios = async () => {
      if (!authState.token) {
        navigate('/auth');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        const scenariosData = await getScenarios(authState.token);
        setScenarios(scenariosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('Failed to load scenarios'));
      } finally {
        setLoading(false);
      }
    };
    
    loadScenarios();
  }, [authState.token, navigate, t]);
  
  const handleScenarioClick = (scenario: Scenario) => {
    navigate(`/scenarios/${scenario._id}`);
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
    <div className="scenarios-page">
      <header className="page-header">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
          style={{ 
            marginRight: '1rem', 
            padding: '0.5rem 1rem', 
            background: 'none', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← {t('Back to Home')}
        </button>
        <h1>{t('scenarios')}</h1>
        <div className="scenarios-stats">
          <h2>{t('Total Scenarios')}: {scenarios.length}</h2>
        </div>
      </header>
      
      <main className="scenarios-main">
        <div className="scenarios-grid">
          {scenarios.length === 0 ? (
            <div className="no-scenarios">{t('No scenarios found')}</div>
          ) : (
            scenarios.map(scenario => (
              <div 
                key={scenario._id} 
                className="scenario-card"
                onClick={() => handleScenarioClick(scenario)}
              >
                <h3 className="scenario-title">
                  {t('current_language') === 'zh' ? scenario.title : scenario.titleEn}
                </h3>
                <p className="scenario-description">
                  {t('current_language') === 'zh' ? scenario.description : scenario.descriptionEn}
                </p>
                <div className="scenario-type">
                  <span className="type-badge">{scenario.type}</span>
                </div>
                <button className="view-details-button">
                  {t('View Details')} →
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ScenariosPage;
