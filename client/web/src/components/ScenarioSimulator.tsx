
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { simulateScenarioStream } from '../services/matchService';
import './ScenarioSimulator.css';

interface ScenarioSimulatorProps {
  userId: string;
  isPremium: boolean;
  token: string | null;
}

/**
 * AI 场景模拟器组件
 * 
 * 功能：
 * - 允许 Premium 用户选择特定场景（冲突、亲密、旅行等）进行模拟。
 * - 调用后端流式 API，实时展示 AI 生成的互动剧本。
 * - 支持中英文多语言切换，自动根据当前应用语言请求对应内容。
 * - 包含非 Premium 用户的锁定状态 UI，引导升级。
 */
const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ userId, isPremium, token }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<string>('conflict');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    setResult('');

    await simulateScenarioStream(
      token,
      userId,
      selectedScenario,
      i18n.language, // Pass current language
      (content) => {
        setResult((prev) => prev + content);
      },
      (credits) => {
        setRemainingCredits(credits);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
  };

  if (!isPremium) {
    return (
      <div className="scenario-simulator locked">
        <div className="lock-overlay">
          <div className="lock-icon">🔒</div>
          <h3>{t('Unlock AI Scenarios')}</h3>
          <p>{t('See how you interact in real life situations.')}</p>
          <button 
            className="upgrade-button" 
            onClick={() => navigate('/subscription')}
          >
            {t('Upgrade to Premium')}
          </button>
        </div>
        <div className="blurred-content">
          <h3>{t('Scenario Simulator')}</h3>
          <div className="mock-controls">
            <select disabled><option>{t('Conflict Resolution')}</option></select>
            <button disabled>{t('Simulate')}</button>
          </div>
          <div className="mock-text">
            ██████ ████ ████████ ██████████ ████...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scenario-simulator">
      <h3>{t('AI Relationship Simulator')}</h3>
      <p className="subtitle">{t('Visualize your dynamic in different scenarios.')}</p>

      <div className="controls">
        <select 
          value={selectedScenario} 
          onChange={(e) => setSelectedScenario(e.target.value)}
          disabled={loading}
        >
          <option value="conflict">{t('Conflict Resolution')}</option>
          <option value="intimacy">{t('Romantic Moment')}</option>
          <option value="travel">{t('Travel Planning')}</option>
          <option value="daily_life">{t('Daily Life')}</option>
        </select>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="generate-button"
        >
          {loading ? t('Simulating...') : t('Simulate')}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="scenario-result">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default ScenarioSimulator;
