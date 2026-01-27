
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load .env from server/ directory
const mongoose = require('mongoose');
const User = require('../models/User');
const { updateUserVector } = require('../services/vectorService');

// Polyfill for vector service if needed (usually handled in service, but let's be safe)
const fetch = require('node-fetch');
const FormData = require('form-data');
const AbortController = require('abort-controller');
const { Headers } = fetch;
global.Headers = global.Headers || Headers;
global.FormData = global.FormData || FormData;
global.AbortController = global.AbortController || AbortController;

async function regenerateAllVectors() {
  try {
    console.log('Connecting to MongoDB...');
    // Replace 'mongodb' host with 'localhost' for local script execution
    const mongoUri = process.env.MONGO_URI.replace('mongodb://mongodb:', 'mongodb://localhost:');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected.');

    const users = await User.find({});
    console.log(`Found ${users.length} users to update.`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`[${i + 1}/${users.length}] Updating vector for user: ${user.username} (${user._id})`);
      
      try {
        await updateUserVector(user._id);
        console.log(`  -> Success`);
      } catch (err) {
        console.error(`  -> Failed: ${err.message}`);
      }
      
      // Add a small delay to avoid hitting API rate limits too hard
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('All updates completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

regenerateAllVectors();
