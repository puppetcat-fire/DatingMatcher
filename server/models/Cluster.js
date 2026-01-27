/**
 * 聚类模型 (Cluster)
 * 用于存储 K-Means 聚类生成的群体中心和特征描述
 */
const mongoose = require('mongoose');

const ClusterSchema = new mongoose.Schema({
  centroid: {
    type: [Number], // 聚类中心的向量 (1536维)
    required: true
  },
  summary: {
    type: String, // 该群体的 AI 生成画像描述 (例如: "注重传统的家庭型人格")
    default: ''
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // 属于该群体的用户列表
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cluster', ClusterSchema);
