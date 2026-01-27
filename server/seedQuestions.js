const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Question = require('./models/Question');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/datingmatcher')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedQuestions = async () => {
  try {
    // Delete existing questions
    await Question.deleteMany();
    console.log('Deleted existing questions');

    // Read questions from JSON file
    const questionsPath = path.join(__dirname, 'questions.json');
    if (!fs.existsSync(questionsPath)) {
      console.error('questions.json not found. Please run generate_questions.py first.');
      process.exit(1);
    }

    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsData);

    // Insert new questions
    await Question.insertMany(questions);
    console.log(`Inserted ${questions.length} questions from questions.json`);

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding questions:', error);
    mongoose.connection.close();
  }
};

seedQuestions();
