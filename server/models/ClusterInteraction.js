/**
 * 聚类互动模型 (ClusterInteraction)
 * 用于存储不同用户群体之间的预计算互动结果
 * 目的：减少实时匹配时的 Token 消耗，支持 AI 预测功能
 */
const mongoose = require('mongoose');

const ClusterInteractionSchema = new mongoose.Schema({
  clusterA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
    required: true
  },
  clusterB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
    required: true
  },
  scenario: {
    type: String, // 场景类型: 'conflict'(冲突), 'intimacy'(亲密), 'travel'(旅行), 'daily_life'(日常)
    required: true
  },
  matchScore: {
    type: Number, // 匹配度 (0-100)
    required: true
  },
  complementarityScore: {
    type: Number, // 互补度 (0-100)
  },
  conflictScore: {
    type: Number, // 冲突度 (0-100)
  },
  analysis: {
    type: String, // AI 生成的互动分析摘要
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast lookup
ClusterInteractionSchema.index({ clusterA: 1, clusterB: 1, scenario: 1 }, { unique: true });

module.exports = mongoose.model('ClusterInteraction', ClusterInteractionSchema);
