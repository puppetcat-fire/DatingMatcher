/**
 * 认证控制器
 * 负责处理用户注册、登录、资料管理、密码重置等认证相关功能
 * 新增：答题统计、付费用户管理功能
 */

// 引入依赖模块
const User = require('../models/User'); // 用户模型
const jwt = require('jsonwebtoken'); // JWT生成和验证
const crypto = require('crypto'); // 密码加密和令牌生成
const nodemailer = require('nodemailer'); // 邮件发送

/**
 * 生成JWT令牌
 * @param {string} id - 用户ID
 * @returns {string} - 生成的JWT令牌
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // 令牌有效期30天
  });
};

/**
 * 创建邮件发送器
 * 用于发送密码重置邮件
 */
const transporter = nodemailer.createTransport({
  service: 'gmail', // 使用Gmail服务
  auth: {
    user: process.env.EMAIL_USER, // 发件人邮箱
    pass: process.env.EMAIL_PASS // 发件人密码
  }
});

// Register user
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // Password strength validation
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters, including letters, numbers, and special characters' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          isPremiumUser: user.isPremiumUser
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
    }
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('buffering timed out')) {
      res.status(500).json({ message: 'Database connection error. Please check if MongoDB is running.' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          isPremiumUser: user.isPremiumUser
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('buffering timed out')) {
      res.status(500).json({ message: 'Database connection error. Please check if MongoDB is running.' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('buffering timed out')) {
      res.status(500).json({ message: 'Database connection error. Please check if MongoDB is running.' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.profile = { ...user.profile, ...req.body };
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('buffering timed out')) {
      res.status(500).json({ message: 'Database connection error. Please check if MongoDB is running.' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Forgot password - generate and send reset token
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expire time (1 hour)
    const resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email options
    const options = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this email because you (or someone else) has requested a password reset for your DatingMatcher account.

Please click on the following link, or paste this into your browser to complete the process:

${resetUrl}

If you did not request this, please ignore this email and your password will remain unchanged.`
    };

    await transporter.sendMail(options);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('buffering timed out')) {
      res.status(500).json({ message: 'Database connection error. Please check if MongoDB is running.' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash token and match with DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters, including letters, numbers, and special characters' });
    }

    // Set new password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('buffering timed out')) {
      res.status(500).json({ message: 'Database connection error. Please check if MongoDB is running.' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Get user answer statistics
exports.getAnswerStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('dailyAnswerCount lastAnswerDate isPremiumUser answerCount');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate remaining free answers for today
    const today = new Date().setHours(0, 0, 0, 0);
    const lastAnswerDate = new Date(user.lastAnswerDate).setHours(0, 0, 0, 0);
    
    // 设置每日答题限制：非订阅用户5道，订阅用户15道
    const dailyLimit = user.isPremiumUser ? 15 : 5;
    
    const remainingFreeAnswers = today === lastAnswerDate ? 
      Math.max(0, dailyLimit - user.dailyAnswerCount) : dailyLimit;

    res.json({
      dailyAnswerCount: user.dailyAnswerCount,
      remainingFreeAnswers,
      lastAnswerDate: user.lastAnswerDate,
      isPremiumUser: user.isPremiumUser,
      totalAnswerCount: user.answerCount
    });
  } catch (error) {
    console.error('Get answer stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upgrade user to premium
exports.upgradeToPremium = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user to premium
    user.isPremiumUser = true;
    await user.save();

    res.json({
      message: 'Successfully upgraded to premium user',
      isPremiumUser: true
    });
  } catch (error) {
    console.error('Upgrade to premium error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Downgrade user to free
exports.downgradeToFree = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user to free
    user.isPremiumUser = false;
    await user.save();

    res.json({
      message: 'Successfully downgraded to free user',
      isPremiumUser: false
    });
  } catch (error) {
    console.error('Downgrade to free error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
