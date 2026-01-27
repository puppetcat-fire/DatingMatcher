/**
 * DatingMatcher Web 应用主组件
 * 负责应用的路由管理和认证保护
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // React Router 路由组件
import { AuthProvider, useAuth } from './context/AuthContext'; // 认证上下文
// 页面组件导入
import AuthPage from './pages/AuthPage'; // 登录/注册页面
import HomePage from './pages/HomePage'; // 首页
import QuestionsPage from './pages/QuestionsPage'; // 问题列表页面
import AnswerPage from './pages/AnswerPage'; // 答题页面
import MatchesPage from './pages/MatchesPage'; // 匹配结果页面
import ScenariosPage from './pages/ScenariosPage'; // 场景列表页面
import ScenarioDetailPage from './pages/ScenarioDetailPage'; // 场景详情页面
import MatchDetailPage from './pages/MatchDetailPage'; // 匹配详情页面
import ProfilePage from './pages/ProfilePage'; // 个人资料页面
import SubscriptionPage from './pages/SubscriptionPage'; // 订阅页面
import NotFoundPage from './pages/NotFoundPage'; // 404页面
import Layout from './components/Layout'; // 布局组件

import './App.css'; // 应用样式

/**
 * 私有路由组件
 * 用于保护需要认证的路由
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {React.ReactNode} - 渲染结果
 */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth(); // 获取认证状态
  
  // 加载状态处理
  if (authState.isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // 根据认证状态决定渲染内容
  return authState.isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/auth" replace />;
};

/**
 * 应用主组件
 * @returns {React.ReactNode} - 渲染结果
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/questions" 
              element={
                <PrivateRoute>
                  <QuestionsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/questions/:id" 
              element={
                <PrivateRoute>
                  <AnswerPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/matches" 
              element={
                <PrivateRoute>
                  <MatchesPage />
                </PrivateRoute>
              } 
            />
            <Route
              path="/matches/:userId"
              element={
                <PrivateRoute>
                  <MatchDetailPage />
                </PrivateRoute>
              }
            />
            <Route 
              path="/scenarios" 
              element={
                <PrivateRoute>
                  <ScenariosPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/scenarios/:id" 
              element={
                <PrivateRoute>
                  <ScenarioDetailPage />
                </PrivateRoute>
              } 
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <PrivateRoute>
                  <SubscriptionPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
