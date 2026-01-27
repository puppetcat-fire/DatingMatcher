/**
 * 认证相关路由
 * 处理用户注册、登录、资料管理、密码重置、答题统计和高级用户功能
 */

const express = require('express');
const router = express.Router();

// 引入认证控制器和中间件
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  forgotPassword, 
  resetPassword,
  getAnswerStats,
  upgradeToPremium,
  downgradeToFree 
} = require('../controllers/authController'); // 认证控制器
const { protect } = require('../middleware/auth'); // 认证保护中间件

// 基本认证路由
router.post('/register', register); // 注册新用户
router.post('/login', login); // 用户登录
router.get('/profile', protect, getProfile); // 获取当前用户资料
router.put('/profile', protect, updateProfile); // 更新当前用户资料
router.post('/forgot-password', forgotPassword); // 忘记密码请求
router.put('/reset-password/:token', resetPassword); // 重置密码

// 答题统计和高级用户功能路由
router.get('/answer-stats', protect, getAnswerStats); // 获取答题统计信息

// 高级用户升级/降级路由（兼容RESTful和已有路径）
router.post('/upgrade-to-premium', protect, upgradeToPremium); // 兼容旧路径：升级为高级用户
router.post('/downgrade-to-free', protect, downgradeToFree); // 兼容旧路径：降级为免费用户
router.put('/upgrade', protect, upgradeToPremium); // RESTful 升级路径
router.put('/downgrade', protect, downgradeToFree); // RESTful 降级路径

module.exports = router;
