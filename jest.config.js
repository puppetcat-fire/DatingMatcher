module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/client/'],
  collectCoverage: true,
  collectCoverageFrom: ['server/**/*.js', '!server/server.js', '!server/seed*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  setupFiles: ['dotenv/config'],
};
