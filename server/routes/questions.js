/**
 * 问答相关路由
 * 处理问题管理和答案提交等功能
 */

const express = require('express');
const router = express.Router();

// 引入问答控制器和认证中间件
const { 
  getAllQuestions, 
  getQuestion, 
  createQuestion, 
  submitAnswer, 
  getUserAnswers 
} = require('../controllers/questionController'); // 问答控制器
const { protect } = require('../middleware/auth'); // 认证保护中间件

// 问题管理路由
router.get('/', getAllQuestions); // 获取所有问题列表
router.get('/:id', getQuestion); // 获取单个问题详情
router.post('/', createQuestion); // 创建新问题（管理员功能）

// 答案相关路由（需要认证）
router.post('/answer', protect, submitAnswer); // 提交问题答案
router.get('/user/answers', protect, getUserAnswers); // 获取当前用户的所有回答

module.exports = router;
