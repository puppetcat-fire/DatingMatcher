const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  titleEn: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  descriptionEn: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily_life', 'conflict', 'decision', 'future_planning', 'values'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scenario', ScenarioSchema);
