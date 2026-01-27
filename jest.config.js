module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!@shotgunjed)/"],
  testMatch: ["**/tests/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // Use video-core published mock for testing
  moduleNameMapper: {
    "^@newrelic/video-core$": "@newrelic/video-core/__mock__.js"
  }
};
