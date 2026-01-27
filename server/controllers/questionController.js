/**
 * 问题控制器
 * 负责处理问题管理、答案提交等功能
 * 新增：答题限制逻辑（非订阅用户5道/天，订阅用户15道/天）
 */

// 引入依赖模块
const Question = require('../models/Question'); // 问题模型
const User = require('../models/User'); // 用户模型

/**
 * 获取所有问题
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Array} - 问题列表
 */
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error('获取问题列表失败:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single question
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new question
exports.createQuestion = async (req, res) => {
  const { text, textEn, category } = req.body;
  try {
    const question = await Question.create({
      text,
      textEn,
      category
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 提交答案
 * 新增：答题限制逻辑（非订阅用户5道/天，订阅用户15道/天）
 * @param {Object} req - Express请求对象，包含questionId、questionText、answerText
 * @param {Object} res - Express响应对象
 * @returns {Object} - 提交结果和答题统计
 */
exports.submitAnswer = async (req, res) => {
  const { questionId, questionText, answerText } = req.body;
  
  try {
    // 获取当前用户
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 确保用户有answers数组
    if (!user.answers) {
      user.answers = [];
    }

    // 检查用户是否已经回答过该问题
    const existingAnswerIndex = user.answers.findIndex(answer => 
      answer.questionId && answer.questionId.toString() === questionId
    );
    
    // 只有新回答才检查答题限制，更新已有回答不受限制
    if (existingAnswerIndex === -1) {
      // 检查是否是新的一天（重置答题计数）
      const today = new Date().setHours(0, 0, 0, 0);
      const lastAnswerDate = new Date(user.lastAnswerDate).setHours(0, 0, 0, 0);
      
      // 如果是新的一天，重置每日答题计数
      if (today !== lastAnswerDate) {
        user.dailyAnswerCount = 0;
      }
      
      // 设置每日答题限制
      // 非订阅用户：5道/天
      // 订阅用户：15道/天
      const dailyLimit = user.isPremiumUser ? 15 : 5;
      
      // 检查是否已达到每日限制
      if (user.dailyAnswerCount >= dailyLimit) {
        return res.status(403).json({ 
          code: 'DAILY_LIMIT_REACHED',
          message: 'DAILY_LIMIT_REACHED',
          dailyLimitReached: true,
          dailyLimit,
          remainingFreeAnswers: 0
        });
      }
      
      // 增加答题计数
      user.dailyAnswerCount += 1; // 每日答题计数
      user.answerCount += 1; // 总答题计数
      user.lastAnswerDate = new Date(); // 更新最后答题日期
    }
    
    // 更新或添加回答
    if (existingAnswerIndex !== -1) {
      // 更新已有回答
      user.answers[existingAnswerIndex] = {
        questionId,
        questionText: questionText || '',
        answerText,
        createdAt: Date.now() // 更新回答时间
      };
    } else {
      // 添加新回答
      user.answers.push({
        questionId,
        questionText: questionText || '',
        answerText
      });
    }

    // 保存用户数据（测试环境下可能会mock save方法）
    if (typeof user.save === 'function') {
      await user.save();
    }
    
    // 返回提交结果和答题统计
    res.json({ 
      message: 'Answer submitted successfully',
      dailyAnswerCount: user.dailyAnswerCount, // 当前日答题数
      totalAnswerCount: user.answerCount // 总答题数
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user answers
exports.getUserAnswers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Manually return only answers instead of using .select('answers')
    res.json(user.answers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
