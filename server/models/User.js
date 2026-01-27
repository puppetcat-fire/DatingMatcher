const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * 用户模型
 * 存储用户的核心信息、回答记录、生成的向量、聚类分配及答题限制状态
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  profile: {
    // 基础信息
    name: String,
    age: Number,
    gender: String,
    location: String,
    income: String,
    assets: String,
    bio: String,
    avatar: String,

    // 扩展信息 (硬性指标)
    education: String,      // 学历
    occupation: String,     // 职业
    height: Number,         // 身高 (cm)
    marriage_status: String,// 婚姻状况
    children: String,       // 子女情况
    drinking: String,       // 饮酒习惯
    smoking: String,        // 吸烟习惯
    religion: String,       // 宗教信仰
    isVerified: {           // 身份认证状态
      type: Boolean,
      default: false
    }
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    questionText: String,
    answerText: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  vector: {
    type: [Number], // 存储从大模型获取的语义向量 (通常为 1536 维)
    default: []
  },
  clusterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
    index: true // 聚类 ID，用于快速筛选群体
  },
  // 答题计数相关字段
  dailyAnswerCount: {
    type: Number,
    default: 0
  },
  lastAnswerDate: {
    type: Date,
    default: Date.now
  },
  dailySimulationCount: {
    type: Number,
    default: 0
  },
  lastSimulationDate: {
    type: Date,
    default: Date.now
  },
  isPremiumUser: {
    type: Boolean,
    default: false
  },
  answerCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
