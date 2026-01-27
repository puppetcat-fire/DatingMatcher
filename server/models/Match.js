const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  compatibilityScore: {
    type: Number,
    default: 0
  },
  similarityScore: {
    type: Number,
    default: 0
  },
  complementarityScore: {
    type: Number,
    default: 0
  },
  conflictScore: {
    type: Number,
    default: 0
  },
  matchType: {
    type: String,
    enum: ['complementary', 'similar', 'suitable', 'conflicting'],
    default: 'suitable'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', MatchSchema);
