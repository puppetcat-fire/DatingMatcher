export interface User {
  _id: string;
  username: string;
  email: string;
  /**
   * 用户个人资料
   * 包含基础信息和扩展的硬性指标
   * 注意：这些字段用于基础筛选和用户画像展示
   */
  profile: {
    // 基础信息
    name?: string;
    age?: number;
    gender?: string;
    location?: string;
    income?: string;
    assets?: string;
    bio?: string;
    avatar?: string;
    
    // 扩展信息 (新增硬性指标)
    education?: string;      // 学历: High School, Bachelor, Master, PhD
    occupation?: string;     // 职业
    height?: number;         // 身高 (cm)
    marriage_status?: string; // 婚姻状况: Single, Divorced, Widowed
    children?: string;       // 子女情况: None, Has Children, Want Children, No Children
    drinking?: string;       // 饮酒习惯: Never, Socially, Often
    smoking?: string;        // 吸烟习惯: Never, Socially, Often
    religion?: string;       // 宗教信仰
    isVerified?: boolean;    // 是否已通过身份认证 (实名认证徽章)
  };
  answers?: Answer[];
  vector?: number[];
  answerCount?: number;
  isPremiumUser?: boolean;
  createdAt?: Date;
}

export interface Answer {
  questionId: string;
  questionText: string;
  answerText: string;
  createdAt: Date;
}

export interface Question {
  _id: string;
  text: string;
  textEn: string;
  category: string;
  createdAt?: Date;
}

export interface Match {
  userId: string;
  username: string;
  profile: User['profile'];
  compatibilityScore: number;
  similarityScore: number;
  complementarityScore: number;
  conflictScore: number;
  matchType: 'similar' | 'complementary' | 'suitable' | 'conflicting';
  clusterPrediction?: {
    score: number;
    analysis: string;
    scenario: string;
  };
}

export interface MatchDetail {
  matchedUser: {
    _id: string;
    username: string;
    profile: User['profile'];
  };
  scores: {
    compatibilityScore: number;
    similarityScore: number;
    complementarityScore: number;
    conflictScore: number;
  };
  matchReason: string;
  matchType: 'similar' | 'complementary' | 'suitable' | 'conflicting';
  canViewConflictInsights: boolean;
  premiumConflictInsights?: {
    conflictScore: number;
    hasPotentialConflicts: boolean;
    conflictQuestions: string[];
  } | null;
}

export interface Scenario {
  _id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  type: string;
  createdAt?: Date;
}

export interface ScenarioMatch {
  userId: string;
  name: string;
  age: number;
  scenarioMatchScore: number;
  analysis: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: User['profile']) => Promise<void>;
}
