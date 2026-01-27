/**
 * 认证上下文
 * 管理应用的认证状态和相关操作
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom'; // 导航钩子
import { AuthContextType, AuthState, User } from '../types'; // 类型定义
// 认证服务导入
import { 
  login as loginService, 
  register as registerService, 
  getProfile as getProfileService, 
  updateProfile as updateProfileService 
} from '../services/authService';

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证上下文提供者组件
 * @param {Object} props - 组件属性
 * @param {ReactNode} props.children - 子组件
 * @returns {ReactNode} - 渲染结果
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 认证状态初始化
  const [authState, setAuthState] = useState<AuthState>({
    user: null, // 当前登录用户
    token: localStorage.getItem('token'), // JWT令牌（从localStorage获取）
    isAuthenticated: !!localStorage.getItem('token'), // 是否已认证
    isLoading: true, // 是否正在加载
    error: null, // 错误信息
  });
  
  const navigate = useNavigate(); // 导航实例

  /**
   * 组件挂载时加载用户信息
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 如果有令牌，尝试获取用户信息
        if (token) {
          try {
            const user = await getProfileService(token);
            setAuthState(prev => ({
              ...prev,
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            }));
          } catch (error) {
            // 获取用户信息失败，清除令牌并重置状态
            localStorage.removeItem('token');
            setAuthState(prev => ({
              ...prev,
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to load user',
            }));
          }
        } else {
          // 无令牌，直接设置为未认证状态
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
          }));
        }
      } catch (error) {
        console.error('Unexpected error in loadUser:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'An unexpected error occurred',
        }));
      }
    };

    loadUser();
  }, []);

  /**
   * 用户登录
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   * @returns {Promise<void>} - 登录结果
   * @throws {Error} - 登录失败时抛出错误
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await loginService(email, password);
      localStorage.setItem('token', response.token);
      
      // 更新认证状态
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // 登录成功后导航到首页
      navigate('/');
    } catch (error) {
      // 登录失败，更新错误状态
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      }));
      throw error;
    }
  };

  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   * @returns {Promise<void>} - 注册结果
   * @throws {Error} - 注册失败时抛出错误
   */
  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await registerService(username, email, password);
      localStorage.setItem('token', response.token);
      
      // 更新认证状态
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // 注册成功后导航到首页
      navigate('/');
    } catch (error) {
      // 注册失败，更新错误状态
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
      }));
      throw error;
    }
  };

  /**
   * 用户登出
   * @returns {void} - 无返回值
   */
  const logout = () => {
    // 清除令牌
    localStorage.removeItem('token');
    
    // 重置认证状态
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    
    // 登出后导航到登录页
    navigate('/auth');
  };

  /**
   * 更新用户资料
   * @param {User['profile']} profile - 用户资料
   * @returns {Promise<void>} - 更新结果
   * @throws {Error} - 更新失败时抛出错误
   */
  const updateProfile = async (profile: User['profile']) => {
    if (!authState.token) {
      throw new Error('No token found');
    }

    try {
      const updatedUser = await updateProfileService(authState.token, profile);
      
      // 更新用户信息
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        error: null,
      }));
    } catch (error) {
      // 更新失败，更新错误状态
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      }));
      throw error;
    }
  };

  // 提供认证上下文值
  return (
    <AuthContext.Provider value={{ authState, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 认证上下文钩子
 * @returns {AuthContextType} - 认证上下文值
 * @throws {Error} - 不在AuthProvider内使用时抛出错误
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
