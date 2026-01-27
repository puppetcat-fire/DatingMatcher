import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { getAnswerStats } from '../services/authService';

/**
 * 个人资料页面 (ProfilePage)
 * 
 * 功能描述：
 * 1. 用户核心信息展示：头像、用户名、会员状态、认证状态。
 * 2. 详细资料编辑：采用侧边栏布局，支持编辑 9 大类硬性指标（学历、职业、身高、生活习惯等）。
 * 3. 身份认证入口：提供身份认证申请功能，认证成功后显示绿色 Verified 徽章。
 * 4. 订阅管理入口：提供跳转到 SubscriptionPage 的入口。
 * 5. 导航闭环：顶部提供“返回主页”按钮。
 */
const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { authState, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<User['profile']>({
    name: authState.user?.profile?.name || '',
    age: authState.user?.profile?.age,
    gender: authState.user?.profile?.gender || '',
    location: authState.user?.profile?.location || '',
    income: authState.user?.profile?.income || '',
    assets: authState.user?.profile?.assets || '',
    bio: authState.user?.profile?.bio || '',
    avatar: authState.user?.profile?.avatar || '',
    education: authState.user?.profile?.education || '',
    occupation: authState.user?.profile?.occupation || '',
    height: authState.user?.profile?.height,
    marriage_status: authState.user?.profile?.marriage_status || '',
    children: authState.user?.profile?.children || '',
    drinking: authState.user?.profile?.drinking || '',
    smoking: authState.user?.profile?.smoking || '',
    religion: authState.user?.profile?.religion || '',
    isVerified: authState.user?.profile?.isVerified || false,
  });

  const [stats, setStats] = useState<{
    dailyAnswerCount: number;
    remainingFreeAnswers: number;
    lastAnswerDate: string;
    isPremiumUser: boolean;
    totalAnswerCount: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      if (!authState.token) {
        return;
      }
      try {
        setLoading(true);
        setError('');
        const data = await getAnswerStats(authState.token);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('Failed to load answer stats'));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [authState.token, t]);

  const handleInputChange = (field: keyof User['profile'], value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: (field === 'age' || field === 'height') && value !== '' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(profile);
      setSuccess(t('Profile updated successfully'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = () => {
    // Mock verification process
    alert(t('Verification request sent! We will review your identity shortly.'));
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!authState.user) {
    return <div className="error-message">{t('User not found')}</div>;
  }

  return (
    <div className="profile-page">
      <main className="profile-main">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← {t('Back to Home')}
          </button>
          <h1>{t('profile')}</h1>
        </div>
        
        <div className="profile-layout">
          <section className="profile-sidebar">
            <div className="profile-avatar-card">
              <div className="avatar-wrapper">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {authState.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                {stats?.isPremiumUser && <div className="premium-badge">👑</div>}
              </div>
              
              <h2>{authState.user.username}</h2>
              <div className="verification-status">
                {profile.isVerified ? (
                  <span className="verified-badge">✓ {t('Verified Identity')}</span>
                ) : (
                  <button className="verify-btn" onClick={handleVerify}>
                    {t('Verify Identity')}
                  </button>
                )}
              </div>

              <div className="membership-status">
                <h3>{t('Membership Status')}</h3>
                <p className={stats?.isPremiumUser ? 'status-premium' : 'status-free'}>
                  {stats?.isPremiumUser ? t('Premium Member') : t('Free Member')}
                </p>
                <button 
                  className="manage-subscription-btn"
                  onClick={() => navigate('/subscription')}
                >
                  {t('Manage Subscription')}
                </button>
              </div>

              {stats && (
                <div className="usage-stats">
                  <div className="stat-item">
                    <label>{t('Questions Answered')}</label>
                    <span>{stats.totalAnswerCount}</span>
                  </div>
                  {!stats.isPremiumUser && (
                    <div className="stat-item">
                      <label>{t('Daily Remaining')}</label>
                      <span>{stats.remainingFreeAnswers}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="profile-content">
            <div className="content-card">
              <h2>{t('Edit Profile')}</h2>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleSubmit} className="profile-form">
                {/* Basic Info */}
                <h3 className="form-section-title">{t('Basic Info')}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>{t('Name')}</label>
                    <input
                      type="text"
                      value={profile.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('Age')}</label>
                    <input
                      type="number"
                      value={profile.age !== undefined ? String(profile.age) : ''}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('Gender')}</label>
                    <select
                      value={profile.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    >
                      <option value="">{t('Select Gender')}</option>
                      <option value="Male">{t('Male')}</option>
                      <option value="Female">{t('Female')}</option>
                      <option value="Other">{t('Other')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('Location')}</label>
                    <input
                      type="text"
                      value={profile.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Details */}
                <h3 className="form-section-title">{t('Personal Details')}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>{t('Height (cm)')}</label>
                    <input
                      type="number"
                      value={profile.height !== undefined ? String(profile.height) : ''}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('Education')}</label>
                    <select
                      value={profile.education || ''}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    >
                      <option value="">{t('Select Education')}</option>
                      <option value="High School">{t('High School')}</option>
                      <option value="Bachelor">{t('Bachelor')}</option>
                      <option value="Master">{t('Master')}</option>
                      <option value="PhD">{t('PhD')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('Occupation')}</label>
                    <input
                      type="text"
                      value={profile.occupation || ''}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('Income')}</label>
                    <input
                      type="text"
                      value={profile.income || ''}
                      onChange={(e) => handleInputChange('income', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('Marriage Status')}</label>
                    <select
                      value={profile.marriage_status || ''}
                      onChange={(e) => handleInputChange('marriage_status', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    >
                      <option value="">{t('Select Status')}</option>
                      <option value="Single">{t('Single')}</option>
                      <option value="Divorced">{t('Divorced')}</option>
                      <option value="Widowed">{t('Widowed')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('Children')}</label>
                    <select
                      value={profile.children || ''}
                      onChange={(e) => handleInputChange('children', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    >
                      <option value="">{t('Select Option')}</option>
                      <option value="None">{t('None')}</option>
                      <option value="Has Children">{t('Has Children')}</option>
                      <option value="Want Children">{t('Want Children')}</option>
                      <option value="No Children">{t('No Children')}</option>
                    </select>
                  </div>
                </div>

                {/* Lifestyle */}
                <h3 className="form-section-title">{t('Lifestyle')}</h3>
                <div className="form-grid">
                   <div className="form-group">
                    <label>{t('Drinking')}</label>
                    <select
                      value={profile.drinking || ''}
                      onChange={(e) => handleInputChange('drinking', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    >
                      <option value="">{t('Select Option')}</option>
                      <option value="Never">{t('Never')}</option>
                      <option value="Socially">{t('Socially')}</option>
                      <option value="Often">{t('Often')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('Smoking')}</label>
                    <select
                      value={profile.smoking || ''}
                      onChange={(e) => handleInputChange('smoking', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    >
                      <option value="">{t('Select Option')}</option>
                      <option value="Never">{t('Never')}</option>
                      <option value="Socially">{t('Socially')}</option>
                      <option value="Often">{t('Often')}</option>
                    </select>
                  </div>
                   <div className="form-group">
                    <label>{t('Religion')}</label>
                    <input
                      type="text"
                      value={profile.religion || ''}
                      onChange={(e) => handleInputChange('religion', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('Assets')}</label>
                    <input
                      type="text"
                      value={profile.assets || ''}
                      onChange={(e) => handleInputChange('assets', e.target.value)}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="form-group full-width">
                  <label>{t('About Me')}</label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="form-textarea"
                    disabled={saving}
                    rows={4}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={saving}>
                    {saving ? t('Saving...') : t('Save Profile')}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
