/**
 * 匹配相关路由
 * 处理用户匹配列表、匹配详情和创建匹配记录等功能
 */

const express = require('express');
const router = express.Router();

// 引入匹配控制器和认证中间件
const { 
  getMatches, 
  getMatchDetails, 
  createMatch 
} = require('../controllers/matchController'); // 匹配控制器
const { simulateScenario } = require('../controllers/scenarioController'); // 场景模拟控制器
const { protect } = require('../middleware/auth'); // 认证保护中间件

// 所有匹配路由都需要认证
router.get('/', protect, getMatches); // 获取当前用户的匹配列表
router.get('/:userId', protect, getMatchDetails); // 获取与特定用户的匹配详情
router.post('/', protect, createMatch); // 创建匹配记录

// [Premium] 场景模拟
router.post('/:userId/scenario', protect, simulateScenario);

module.exports = router;
