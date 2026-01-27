import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Question, Answer } from '../types';
import { getQuestion, submitAnswer, getUserAnswers } from '../services/questionService';

/**
 * 答题页面组件 (AnswerPage)
 * 
 * 功能描述：
 * 1. 展示单个主观题及其详细描述。
 * 2. 允许用户输入和提交长文本答案。
 * 3. **随机流转**：提交成功后，自动重定向回 `/questions` 路由，
 *    由 QuestionsPage 负责计算并跳转到下一道随机未答题目。
 * 4. **每日限制**：如果提交时遇到每日限制错误，会友好提示用户。
 * 5. **导航闭环**：提供返回主页的入口，确保用户不会被困在答题页。
 */
const AnswerPage: React.FC = () => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { id: questionId } = useParams<{ id: string }>();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [answerText, setAnswerText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  useEffect(() => {
    if (!questionId) {
      navigate('/questions');
      return;
    }
    
    const loadQuestionAndAnswer = async () => {
      if (!authState.token) {
        navigate('/auth');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        const [questionData, answersData] = await Promise.all([
          getQuestion(authState.token, questionId),
          getUserAnswers(authState.token)
        ]);
        
        setQuestion(questionData);
        setUserAnswers(answersData);
        
        // Check if user has already answered this question
        const existingAnswer = answersData.find(answer => answer.questionId === questionId);
        if (existingAnswer) {
          setAnswerText(existingAnswer.answerText);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('Failed to load question'));
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestionAndAnswer();
  }, [questionId, authState.token, navigate, t]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question || !authState.token) {
      return;
    }
    
    if (!answerText.trim()) {
      setError(t('Answer cannot be empty'));
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');
      
      await submitAnswer(
        authState.token,
        question._id,
        question.text,
        answerText
      );
      
      setSuccessMessage(t('Answer submitted successfully'));
      
      // Redirect to questions list (which will auto-redirect to next question) after 1.5 seconds
      setTimeout(() => {
        navigate('/questions', { replace: true });
      }, 1000);
    } catch (err) {
      if (err instanceof Error && err.message === 'DAILY_LIMIT_REACHED') {
        setError(t('Daily limit reached message'));
      } else {
        setError(err instanceof Error ? err.message : t('Failed to submit answer'));
      }
    } finally {
      setSubmitting(false);
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
  
  if (error && !successMessage) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!question) {
    return <div className="error-message">{t('Question not found')}</div>;
  }
  
  return (
    <div className="answer-page">
      <div className="page-header">
        <div className="header-buttons">
          <button 
            className="back-button"
            onClick={() => navigate('/')}
            style={{ marginRight: '10px' }}
          >
            ← {t('Back to Home')}
          </button>
        </div>
        <h1>{t('Answer Question')}</h1>
      </div>
      
      <main className="answer-main">
        {successMessage ? (
          <div className="success-message">
            <h2>{successMessage}</h2>
            <p>{t('Redirecting to questions list...')}</p>
          </div>
        ) : (
          <div className="answer-container">
            <div className="question-card">
              <div className="question-header">
                <span className="question-category">{t(question.category)}</span>
              </div>
              <div className="question-text">
                {t('current_language') === 'zh' ? question.text : question.textEn}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="answer-form">
              {error && <div className="form-error">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="answer">{t('Your Answer')}</label>
                <textarea
                  id="answer"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder={t('Type your answer here...')}
                  className="answer-textarea"
                  rows={10}
                  disabled={submitting}
                />
                <div className="char-count">{answerText.length} characters</div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => navigate('/questions')}
                  disabled={submitting}
                >
                  {t('Cancel')}
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={submitting || !answerText.trim()}
                >
                  {submitting ? t('Submitting...') : t('Submit Answer')}
                </button>
              </div>
            </form>
            
            <div className="progress-section">
              <h3>{t('Answer Progress')}</h3>
              <div className="progress-info">
                <span>{t('You have answered')} {userAnswers.length} {t('out of')} {userAnswers.length + 1} {t('questions')}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnswerPage;
