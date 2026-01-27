import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  zh: {
    translation: {
      "appTitle": "婚恋匹配器",
      "welcome": "欢迎使用婚恋匹配器",
      "login": "登录",
      "register": "注册",
      "email": "邮箱",
      "password": "密码",
      "username": "用户名",
      "profile": "个人资料",
      "questions": "问答",
      "matches": "匹配",
      "logout": "退出登录",
      "whatIsRest": "你认为什么是休息？",
      "weekendActivities": "你周末闲下来的时候会选择做什么？",
      "persistentActivity": "你坚持了什么事很长时间？感受如何？",
      "idealLifestyle": "你理想的生活状态是什么样的？",
      "handleConflict": "你如何处理与他人的冲突？",
      "healthyRelationship": "你认为一段健康的关系最重要的是什么？",
      "favoriteBooks": "你喜欢阅读什么样的书籍？",
      "fiveYearPlan": "你对未来5年的规划是什么？",
      "workLifeBalance": "你如何看待工作与生活的平衡？",
      "friendQuality": "你最看重朋友的什么品质？",
      "submitAnswer": "提交答案",
      "yourAnswers": "你的回答",
      "matchScore": "匹配分数",
      "similarity": "相似度",
      "complementarity": "互补度",
      "conflict": "冲突度",
      "matchType": "匹配类型",
      "similar": "相似型",
      "complementary": "互补型",
      "suitable": "合适型",
      "conflicting": "冲突型"
    }
  },
  en: {
    translation: {
      "appTitle": "Dating Matcher",
      "welcome": "Welcome to Dating Matcher",
      "login": "Login",
      "register": "Register",
      "email": "Email",
      "password": "Password",
      "username": "Username",
      "profile": "Profile",
      "questions": "Questions",
      "matches": "Matches",
      "logout": "Logout",
      "whatIsRest": "What do you consider as rest?",
      "weekendActivities": "What do you like to do on your free weekends?",
      "persistentActivity": "What have you persisted in doing for a long time? How does it feel?",
      "idealLifestyle": "What is your ideal lifestyle?",
      "handleConflict": "How do you handle conflicts with others?",
      "healthyRelationship": "What do you think is most important in a healthy relationship?",
      "favoriteBooks": "What kind of books do you like to read?",
      "fiveYearPlan": "What are your plans for the next 5 years?",
      "workLifeBalance": "How do you view work-life balance?",
      "friendQuality": "What quality do you value most in a friend?",
      "submitAnswer": "Submit Answer",
      "yourAnswers": "Your Answers",
      "matchScore": "Match Score",
      "similarity": "Similarity",
      "complementarity": "Complementarity",
      "conflict": "Conflict",
      "matchType": "Match Type",
      "similar": "Similar",
      "complementary": "Complementary",
      "suitable": "Suitable",
      "conflicting": "Conflicting"
    }
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React Native already escapes values
    }
  });

export default i18n;
