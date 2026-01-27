
const mongoose = require('mongoose');
const path = require('path');
const Question = require('./server/models/Question');
require('dotenv').config({ path: path.resolve(__dirname, 'server/.env') });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/datingmatcher')
  .then(async () => {
    const question = await Question.findOne();
    console.log(JSON.stringify(question, null, 2));
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
