import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Question, Answer } from '../types';
import { getQuestions, getUserAnswers } from '../services/questionService';
import { getAnswerStats } from '../services/authService';

/**
 * 问题列表页面组件 (QuestionsPage)
 * 
 * 注意：此页面已不再展示问题列表。
 * 
 * 功能：
 * 1. 自动寻找未回答的问题并跳转。
 * 2. 如果所有问题已回答，显示完成页面。
 * 3. **每日限制拦截**：无论是免费还是订阅用户，一旦达到各自的每日上限（5/15），即停止跳转并显示限制提示。
 * 4. 充当“开始答题”的入口路由。
 */
const QuestionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [answerStats, setAnswerStats] = useState<{
    dailyAnswerCount: number;
    remainingFreeAnswers: number;
    lastAnswerDate: string;
    isPremiumUser: boolean;
    totalAnswerCount: number;
  } | null>(null);
  
  useEffect(() => {
    const loadQuestions = async () => {
      if (!authState.token) {
        navigate('/auth');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        const [questionsData, answersData, statsData] = await Promise.all([
          getQuestions(authState.token),
          getUserAnswers(authState.token),
          getAnswerStats(authState.token)
        ]);
        
        setQuestions(questionsData);
        setUserAnswers(answersData);
        setAnswerStats(statsData);

        // Auto-redirect logic
        const unansweredQuestions = questionsData.filter(
          (q) => !answersData.some((a) => a.questionId === q._id)
        );

        if (unansweredQuestions.length > 0) {
          // Check daily limit (for both Free and Premium users)
          if (statsData && statsData.remainingFreeAnswers <= 0) {
            // Do not redirect, show limit message
            setLoading(false);
            return;
          }

          const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
          const target = unansweredQuestions[randomIndex];
          // Use replace to avoid building up history of the redirect page
          navigate(`/questions/${target._id}`, { replace: true });
        } else {
          // All questions answered
          setLoading(false);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : t('Failed to load questions'));
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [authState.token, navigate, t]);
  
  // Calculate answer progress
  const answeredCount = userAnswers.length;
  const totalQuestions = questions.length;
  
  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>{t('Loading next question...')}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="questions-page">
        <div className="error-message">{error}</div>
        <button className="primary-button" onClick={() => navigate('/')}>{t('Back to Home')}</button>
      </div>
    );
  }
  
  // If we are here, it means either:
  // 1. All questions are answered
  // 2. Daily limit reached
  
  const isLimitReached = answerStats && answerStats.remainingFreeAnswers <= 0;
  const isAllAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  return (
    <div className="questions-page">
      <main className="questions-main" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="page-header">
           <button 
            className="back-button"
            onClick={() => navigate('/')}
            style={{ 
              marginRight: '1rem', 
              padding: '0.5rem 1rem', 
              background: 'none', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '2rem'
            }}
          >
            ← {t('Back to Home')}
          </button>
        </div>

        {isAllAnswered ? (
          <div className="completion-container">
            <div className="completion-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1>{t('Congratulations!')}</h1>
            <p className="completion-text" style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
              {t('You have answered all questions! Generating your match results...')}
            </p>
            <div className="progress-container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
               <div className="progress-bar-bg" style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '5px' }}>
                  <div 
                    className="progress-bar" 
                    style={{ width: '100%', height: '100%', background: '#4CAF50', borderRadius: '5px' }}
                  ></div>
               </div>
               <p>{t('Answered count', { count: answeredCount, total: totalQuestions })} (100%)</p>
            </div>
            <button 
              className="primary-button" 
              onClick={() => navigate('/matches')}
              style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
            >
              {t('View Matches')}
            </button>
          </div>
        ) : isLimitReached ? (
           <div className="limit-container">
            <div className="limit-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
            <h1>{t('Daily Limit Reached')}</h1>
            <p className="limit-text" style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
              {t('Daily limit reached message')}
            </p>
            <p>{t('Come back tomorrow')}</p>
            
            <div className="limit-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="secondary-button"
                onClick={() => navigate('/')}
              >
                {t('Back to Home')}
              </button>
              {!answerStats?.isPremiumUser && (
                <button 
                  className="primary-button"
                  onClick={() => navigate('/subscription')}
                  style={{ background: 'linear-gradient(135deg, #6e8efb, #a777e3)', border: 'none' }}
                >
                  {t('Upgrade to Premium')}
                </button>
              )}
            </div>
           </div>
        ) : (
          // Fallback, should rarely happen due to redirect
          <div className="loading-spinner"></div>
        )}
      </main>
    </div>
  );
};

export default QuestionsPage;
