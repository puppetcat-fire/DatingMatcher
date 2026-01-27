# Romantic Oracle Raven - Dating Matcher App

[中文文档](README.md)

## Project Overview
**Dedicated to reducing the cost of love through technology.**

Romantic Oracle Raven (formerly DatingMatcher) is a dating matching application based on subjective questions and vector models. It supports Android, iOS, and Web platforms, and provides English-Chinese bilingual switching functionality.

## Quick Start

### 1. Prerequisites
- Node.js v14.19.3 (Recommended)
- MongoDB 4.x+
- OpenAI API Key (or compatible DeepSeek/Qwen Key)

### 2. Configure Environment Variables
This project has removed all hardcoded keys. You must configure environment variables.
Copy the example file and rename it to `.env`:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` file and fill in your API keys:
```ini
# DeepSeek / OpenAI / Qwen API Configuration
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_API_KEY=your_sk_key_here
OPENAI_CHAT_MODEL=deepseek-chat
OPENAI_EMBEDDING_MODEL=text-embedding-v1
```

### 3. Install Dependencies

```bash
# Install root dependencies (includes server dependencies)
npm install

# Install frontend dependencies
cd client/web
npm install
```

### 4. Data Initialization
For the first run, it is recommended to initialize basic data:

```bash
# Run in root directory
node server/seeds/seedUsers.js        # Generate test users
node server/seeds/seedQuestions.js    # Import question bank
node server/seeds/seedScenarios.js    # Import simulation scenarios
node server/scripts/runClustering.js  # [NEW] Run clustering analysis (Generate group profiles)
```

### 5. Start Services

```bash
# Start Backend (Port 5000)
cd server
npm start

# Start Frontend (Port 3000)
cd client/web
npm run dev
```

## Core Features

### 1. User Authentication & Profile System
- Email registration (with password strength validation) and login
- **[NEW] Comprehensive User Profile**: In addition to subjective questions, added 9 hard indicators such as height, education, occupation, lifestyle, etc.
- **[NEW] Identity Verification**: Real-name verification badge system to enhance user authenticity.
- **[NEW] Sidebar User Center**: Optimized information management layout supporting modular editing.
- Password reset functionality

### 2. Subjective Question System
- Provides 800+ subjective questions covering lifestyle, values, hobbies, etc.
- Covers 12 core categories to comprehensively build user vector models.
- **[UPDATE] Daily Free Limit**: Free users can answer 5 questions per day (about 160 days to complete profile).
- **[NEW] Paid Subscription System**:
    - Independent subscription management page
    - Free Plan vs Premium Plan benefits comparison
    - **[UPDATE] Accelerated Profile Building**: Premium members can answer 15 questions per day (about 50 days to complete profile).
    - Advanced conflict analysis and in-depth matching reports
- **[UPDATE] Random Exploration Mode**: Automatically pushes questions randomly without a list, maintaining a sense of exploration freshness.

### 3. Intelligent Matching Algorithm
- Generates user vectors based on OpenAI / Qwen Embeddings
- Calculates similarity, complementarity, and conflict between users
- Supports four match types: Similar, Complementary, Suitable, Conflicting
- Match details and answer comparison
- **[NEW] Clustering Pre-screening System**:
    - **Background Batch Processing**: Runs K-Means clustering in the background via `runClustering.js` script.
    - **Group Profiling**: Uses LLM to automatically generate group characteristic descriptions (e.g., "Idealist Group").
    - **Pre-computed Interactions**: Pre-calculates conflict/intimacy scenarios between different groups, significantly reducing real-time matching N² calculation costs.
- **[NEW] AI Forecast**: Displays AI analysis summary based on pre-computed results directly on the match list page (without consuming real-time tokens).
- **[UPDATE] Closed-loop Navigation**: All deep pages support one-click return to home page to prevent getting lost.

### 4. Scenario-based Matching (Underlying Support)
- In-depth matching analysis for specific scenarios (e.g., living together, career development)
- **[NOTE] Built-in Functionality**: Runs as an underlying algorithm, not directly displaying scenario lists to users, but providing scenario-based insights in match details.
- **[NEW] AI Scenario Simulation (Premium)**:
    - **Real-time Depth Simulation**: Generates dialogue scripts for conflict/intimacy/daily life scenarios based on real answers from both parties, previewing relationship dynamics in advance.
    - **Streaming Output**: Supports typewriter effect for real-time generation experience.
    - **Multi-language Support**: Automatically adapts to Chinese/English output.

### 5. Multi-platform Support
- Web: Based on React + TypeScript + Vite
- Mobile: Based on React Native
- Backend: Based on Node.js + Express + MongoDB

### 6. Bilingual Switching
- Supports Chinese/English bilingual switching
- All content and interfaces can switch languages based on user preference

## Tech Stack

### Backend
- **Node.js**: JavaScript Runtime
- **Express**: Web Framework
- **MongoDB**: Database
- **Mongoose**: ODM Library
- **OpenAI API**: Vector Generation
- **JWT**: User Authentication

### Frontend
- **Web**: React 18 + TypeScript + Vite
- **Mobile**: React Native 0.73
- **i18n**: react-i18next

### Containerization
- **Docker**: Supports full Docker deployment
- **Docker Compose**: One-click start for all services

## Project Structure

```
DatingMatcher/
├── client/
│   ├── mobile/          # Mobile code
│   └── web/             # Web code
├── coverage/            # Test coverage reports
├── server/              # Backend code
│   ├── controllers/     # Controllers
│   ├── middleware/      # Middleware
│   ├── models/          # Data models
│   ├── routes/          # Routes
│   ├── services/        # Services
│   └── __tests__/       # Test files
├── .trae/               # Trae AI related files
├── Dockerfile.backend   # Backend Dockerfile
├── Dockerfile.frontend  # Frontend Dockerfile
├── docker-compose.mongodb.yml  # MongoDB Docker config
├── docker-compose.yml   # Full service orchestration config
├── jest.config.js       # Jest config
├── package-lock.json    # Dependency lock file
├── package.json         # Project dependencies
├── PROJECT_DOCUMENTATION.md  # Project documentation
├── README.md            # Project readme
├── REQUIREMENTS.md      # Requirements documentation
└── TESTING.md           # Testing documentation
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register
- POST /api/auth/login - Login
- GET /api/auth/profile - Get Profile
- PUT /api/auth/profile - Update Profile
- POST /api/auth/forgot-password - Forgot Password
- PUT /api/auth/reset-password/:token - Reset Password
- GET /api/auth/answer-stats - Get Answer Stats
- POST /api/auth/upgrade-to-premium - Upgrade to Premium
- POST /api/auth/downgrade-to-free - Downgrade to Free

### Questions
- GET /api/questions - Get All Questions
- GET /api/questions/:id - Get Single Question
- POST /api/questions/answer - Submit Answer
- GET /api/questions/user/answers - Get User Answers

### Matches
- GET /api/matches - Get Match List
- GET /api/matches/:userId - Get Match Details
- POST /api/matches - Create Match

### Scenarios
- GET /api/scenarios - Get All Scenarios
- GET /api/scenarios/:id - Get Single Scenario
- GET /api/scenarios/:scenarioId/matches - Get Scenario Matches

## Development Notes

### Adding New Questions
1. Add new questions in `server/seedQuestions.js`
2. Run seed script: `node server/seedQuestions.js`

### Batch Generate Questions
1. Run Python script to generate 800+ questions: `python server/generate_questions.py`
2. Import generated `questions.json` into database: `mongoimport --db datingmatcher --collection questions --file questions.json --jsonArray`

### Adding New Scenarios
1. Add new scenarios in `server/seedScenarios.js`
2. Run seed script: `node server/seedScenarios.js`

### Adding New Language
1. Add new language translation resources in `client/web/src/i18n.js` and `client/mobile/src/i18n.js`
2. Update language switching logic

## License

MIT License
