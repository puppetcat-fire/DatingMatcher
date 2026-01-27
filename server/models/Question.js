const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  textEn: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'lifestyle', 'values', 'interests', 'career', 'relationship',
      'personality', 'family', 'social', 'thinking', 'emotion', 
      'experience', 'future'
    ],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
