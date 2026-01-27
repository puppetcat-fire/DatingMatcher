import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { upgradeToPremium, downgradeToFree, getAnswerStats } from '../services/authService';
import './SubscriptionPage.css';

/**
 * 订阅管理页面 (SubscriptionPage)
 * 
 * 功能描述：
 * 1. 展示 Free 和 Premium 两种会员计划的详细权益对比。
 * 2. 显示当前用户的订阅状态（Active 标记）。
 * 3. 提供升级 (Upgrade) 和降级 (Downgrade) 操作。
 * 4. 模拟支付流程：点击升级后会有模拟的加载和成功提示。
 * 
 * 注意：目前支付逻辑为前端模拟，实际生产环境需对接 Stripe/PayPal 等支付网关。
 */
const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock current plan check - in reality this should come from authState or API
  // We'll check isPremiumUser from API stats
  const [isPremium, setIsPremium] = useState(false);

  React.useEffect(() => {
    const checkStatus = async () => {
      if (authState.token) {
        try {
          const stats = await getAnswerStats(authState.token);
          setIsPremium(stats.isPremiumUser);
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkStatus();
  }, [authState.token]);

  const handleUpgrade = async () => {
    if (!authState.token) return;
    setLoading(true);
    setError('');
    try {
      await upgradeToPremium(authState.token);
      setIsPremium(true);
      setSuccess(t('Upgraded to Premium successfully!'));
      // Wait a bit then redirect
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Failed to upgrade'));
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!authState.token) return;
    if (!window.confirm(t('Are you sure you want to cancel your Premium subscription?'))) return;
    
    setLoading(true);
    setError('');
    try {
      await downgradeToFree(authState.token);
      setIsPremium(false);
      setSuccess(t('Subscription cancelled. You are now on the Free plan.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Failed to downgrade'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-page">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate('/profile')}>
          ← {t('Back to Profile')}
        </button>
        <h1>{t('Membership Plans')}</h1>
      </header>

      <main className="subscription-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="plans-container">
          {/* Free Plan */}
          <div className={`plan-card free ${!isPremium ? 'current' : ''}`}>
            <div className="plan-header">
              <h2>{t('Free Plan')}</h2>
              <div className="price">$0<span>/mo</span></div>
            </div>
            <ul className="plan-features">
              <li>✓ {t('5 Questions per day')}</li>
              <li>✓ {t('Basic Matching')}</li>
              <li>✓ {t('View Match Scores')}</li>
              <li className="disabled">✗ {t('Advanced Conflict Analysis')}</li>
              <li className="disabled">✗ {t('15 Questions per day')}</li>
              <li className="disabled">✗ {t('Priority Support')}</li>
            </ul>
            <div className="plan-action">
              {!isPremium ? (
                <button className="current-plan-btn" disabled>{t('Current Plan')}</button>
              ) : (
                <button 
                  className="downgrade-btn" 
                  onClick={handleDowngrade}
                  disabled={loading}
                >
                  {loading ? t('Processing...') : t('Downgrade to Free')}
                </button>
              )}
            </div>
          </div>

          {/* Premium Plan */}
          <div className={`plan-card premium ${isPremium ? 'current' : ''}`}>
            {isPremium && <div className="popular-badge">{t('Active')}</div>}
            <div className="plan-header">
              <h2>{t('Premium')}</h2>
              <div className="price">$9.99<span>/mo</span></div>
            </div>
            <ul className="plan-features">
              <li>✓ {t('15 Questions per day')}</li>
              <li>✓ {t('Advanced Matching Algorithms')}</li>
              <li>✓ {t('Deep Conflict Analysis')}</li>
              <li>✓ {t('See Who Liked You')}</li>
              <li>✓ {t('Priority Support')}</li>
              <li>✓ {t('Verified Badge')}</li>
            </ul>
            <div className="plan-action">
              {isPremium ? (
                <button className="current-plan-btn" disabled>{t('Current Plan')}</button>
              ) : (
                <button 
                  className="upgrade-btn" 
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading ? t('Processing...') : t('Upgrade Now')}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPage;
