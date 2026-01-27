/**
 * 匹配控制器
 * 负责处理用户匹配相关功能
 * 包括获取匹配列表、匹配详情和创建匹配记录
 * 匹配算法：基于向量相似度、互补度和冲突度计算综合匹配分数
 */

// 引入依赖模块
const User = require('../models/User'); // 用户模型
const Match = require('../models/Match'); // 匹配记录模型
const ClusterInteraction = require('../models/ClusterInteraction'); // 聚类互动模型
const { updateUserVector, cosineSimilarity, calculateComplementarity, calculateConflict } = require('../services/vectorService'); // 向量服务

/**
 * 获取用户匹配列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Array} - 匹配用户列表，按匹配分数降序排序
 */
exports.getMatches = async (req, res) => {
  try {
    let currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update current user vector if needed (with try-catch to prevent server error)
    if (!currentUser.vector || currentUser.vector.length === 0) {
      try {
        await updateUserVector(currentUser._id);
        // Reload user to get updated vector
        currentUser = await User.findById(req.user._id);
      } catch (error) {
        console.error('Error updating current user vector:', error);
        // Continue with empty vector instead of failing
      }
    }

    // Get all other users
    const otherUsers = await User.find({ _id: { $ne: currentUser._id } });
    
    // [New] Fetch Cluster Interactions for fast pre-screening
    // 预加载当前用户所在群体与其他群体的互动数据，用于快速预筛选和AI预测展示
    // 避免了对每个匹配用户都进行昂贵的实时AI模拟
    let clusterInteractionsMap = {};
    if (currentUser.clusterId) {
      const interactions = await ClusterInteraction.find({
        $or: [{ clusterA: currentUser.clusterId }, { clusterB: currentUser.clusterId }]
      });
      interactions.forEach(ci => {
        const otherId = ci.clusterA.equals(currentUser.clusterId) ? ci.clusterB.toString() : ci.clusterA.toString();
        if (!clusterInteractionsMap[otherId]) clusterInteractionsMap[otherId] = {};
        clusterInteractionsMap[otherId][ci.scenario] = ci;
      });
    }

    const matches = [];

    for (const user of otherUsers) {
      // Skip users without vectors
      if (!user.vector || user.vector.length === 0) {
        continue;
      }

      // Calculate scores
      const similarityScore = cosineSimilarity(currentUser.vector, user.vector);
      const complementarityScore = calculateComplementarity(currentUser.vector, user.vector);
      const conflictScore = calculateConflict(currentUser.vector, user.vector);
      
      // Calculate overall compatibility score
      const compatibilityScore = (similarityScore * 0.4) + (complementarityScore * 0.4) - (conflictScore * 0.2);

      // Determine match type
      let matchType = 'suitable';
      if (compatibilityScore > 0.7) {
        matchType = similarityScore > complementarityScore ? 'similar' : 'complementary';
      } else if (conflictScore > 0.5) {
        matchType = 'conflicting';
      }

      // [New] Check cluster prediction
      // 如果双方都有群体归属，则提取预计算的“冲突场景”分析作为AI预测摘要
      // 这不需要消耗额外的Token，且响应速度极快
      let clusterPrediction = null;
      if (currentUser.clusterId && user.clusterId) {
         const ints = clusterInteractionsMap[user.clusterId.toString()];
         if (ints && ints['conflict']) { // Default to conflict scenario as a teaser
            clusterPrediction = {
               score: ints['conflict'].matchScore,
               analysis: ints['conflict'].analysis,
               scenario: 'conflict'
            };
         }
      }

      matches.push({
        userId: user._id,
        username: user.username,
        profile: user.profile,
        compatibilityScore: parseFloat(compatibilityScore.toFixed(2)),
        similarityScore: parseFloat(similarityScore.toFixed(2)),
        complementarityScore: parseFloat(complementarityScore.toFixed(2)),
        conflictScore: parseFloat(conflictScore.toFixed(2)),
        matchType,
        clusterPrediction
      });
    }

    // Sort matches by compatibility score (descending)
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json(matches);
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 获取匹配详情
 * @param {Object} req - Express请求对象，包含匹配用户ID
 * @param {Object} res - Express响应对象
 * @returns {Object} - 匹配详情，包含双方用户信息、匹配分数和回答对比
 */
exports.getMatchDetails = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const matchedUser = await User.findById(req.params.userId);
    
    if (!currentUser || !matchedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate scores with vector validation
    let similarityScore = 0;
    let complementarityScore = 0;
    let conflictScore = 0;
    let compatibilityScore = 0;
    
    if (currentUser.vector && currentUser.vector.length > 0 && matchedUser.vector && matchedUser.vector.length > 0) {
      similarityScore = cosineSimilarity(currentUser.vector, matchedUser.vector);
      complementarityScore = calculateComplementarity(currentUser.vector, matchedUser.vector);
      conflictScore = calculateConflict(currentUser.vector, matchedUser.vector);
      compatibilityScore = (similarityScore * 0.4) + (complementarityScore * 0.4) - (conflictScore * 0.2);
    } else {
      // If either user has no vector, set default scores
      console.log('One or both users have no vector, using default scores');
    }

    // Determine match type (用于前端展示“合适/不合适”等结论)
    let matchType = 'suitable';
    if (compatibilityScore > 0.7) {
      matchType = similarityScore > complementarityScore ? 'similar' : 'complementary';
    } else if (conflictScore > 0.5) {
      matchType = 'conflicting';
    }

    // Generate match reason based on scores
    let matchReason = '';
    if (conflictScore > 0.5) {
      matchReason = '你们之间存在较多冲突点，建议进一步了解后再做决定。';
    } else if (compatibilityScore > 0.7) {
      if (similarityScore > complementarityScore) {
        matchReason = '你们在价值观和生活方式上高度相似，相处起来会比较融洽。';
      } else {
        matchReason = '你们在性格和兴趣爱好上具有互补性，能够相互学习和成长。';
      }
    } else {
      matchReason = '你们有一定的匹配度，可以进一步了解对方的详细情况。';
    }

    // 仅对会员用户提供“潜在冲突场景”提示，不返回对方完整回答内容
    const isPremiumUser = !!currentUser.isPremiumUser;
    let premiumConflictInsights = null;

    if (isPremiumUser && Array.isArray(currentUser.answers) && Array.isArray(matchedUser.answers)) {
      const otherAnswersMap = new Map();
      matchedUser.answers.forEach((answer) => {
        if (answer.questionId) {
          otherAnswersMap.set(String(answer.questionId), answer);
        }
      });

      const conflictQuestions = [];

      currentUser.answers.forEach((answer) => {
        if (!answer.questionId) {
          return;
        }
        const other = otherAnswersMap.get(String(answer.questionId));
        if (!other) {
          return;
        }
        const selfText = (answer.answerText || '').trim();
        const otherText = (other.answerText || '').trim();
        if (selfText && otherText && selfText !== otherText && answer.questionText) {
          conflictQuestions.push(answer.questionText);
        }
      });

      premiumConflictInsights = {
        conflictScore: parseFloat(conflictScore.toFixed(2)),
        hasPotentialConflicts: conflictQuestions.length > 0,
        conflictQuestions: conflictQuestions.slice(0, 5)
      };
    }

    // [New] Fetch Cluster Prediction
    let clusterPrediction = null;
    if (currentUser.clusterId && matchedUser.clusterId) {
       const interaction = await ClusterInteraction.findOne({
         $or: [
           { clusterA: currentUser.clusterId, clusterB: matchedUser.clusterId, scenario: 'conflict' }, // Default to conflict
           { clusterA: matchedUser.clusterId, clusterB: currentUser.clusterId, scenario: 'conflict' }
         ]
       });
       if (interaction) {
          clusterPrediction = {
             score: interaction.matchScore,
             analysis: interaction.analysis,
             scenario: 'conflict'
          };
       }
    }

    res.json({
      matchedUser: {
        _id: matchedUser._id,
        username: matchedUser.username,
        profile: matchedUser.profile
      },
      scores: {
        compatibilityScore: parseFloat(compatibilityScore.toFixed(2)),
        similarityScore: parseFloat(similarityScore.toFixed(2)),
        complementarityScore: parseFloat(complementarityScore.toFixed(2)),
        conflictScore: parseFloat(conflictScore.toFixed(2))
      },
      matchType,
      matchReason,
      canViewConflictInsights: isPremiumUser,
      premiumConflictInsights,
      clusterPrediction
    });
  } catch (error) {
    console.error('Error getting match details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 创建匹配记录
 * @param {Object} req - Express请求对象，包含匹配用户ID
 * @param {Object} res - Express响应对象
 * @returns {Object} - 创建的匹配记录
 */
exports.createMatch = async (req, res) => {
  const { userId } = req.body;
  try {
    const currentUser = await User.findById(req.user._id);
    const matchedUser = await User.findById(userId);
    
    if (!currentUser || !matchedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if match already exists
    const existingMatch = await Match.findOne({
      $or: [
        { user1: currentUser._id, user2: matchedUser._id },
        { user1: matchedUser._id, user2: currentUser._id }
      ]
    });

    if (existingMatch) {
      return res.status(400).json({ message: 'Match already exists' });
    }

    // Calculate scores with vector validation
    let similarityScore = 0;
    let complementarityScore = 0;
    let conflictScore = 0;
    let compatibilityScore = 0;
    
    if (currentUser.vector && currentUser.vector.length > 0 && matchedUser.vector && matchedUser.vector.length > 0) {
      similarityScore = cosineSimilarity(currentUser.vector, matchedUser.vector);
      complementarityScore = calculateComplementarity(currentUser.vector, matchedUser.vector);
      conflictScore = calculateConflict(currentUser.vector, matchedUser.vector);
      compatibilityScore = (similarityScore * 0.4) + (complementarityScore * 0.4) - (conflictScore * 0.2);
    } else {
      // If either user has no vector, set default scores
      console.log('One or both users have no vector, using default scores for match creation');
    }

    // Determine match type
    let matchType = 'suitable';
    if (compatibilityScore > 0.7) {
      matchType = similarityScore > complementarityScore ? 'similar' : 'complementary';
    } else if (conflictScore > 0.5) {
      matchType = 'conflicting';
    }

    // Create match record
    const match = await Match.create({
      user1: currentUser._id,
      user2: matchedUser._id,
      compatibilityScore,
      similarityScore,
      complementarityScore,
      conflictScore,
      matchType
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
