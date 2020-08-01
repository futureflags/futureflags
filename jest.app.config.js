module.exports = {
  displayName: 'App',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/api/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  setupFiles: ['<rootDir>/scripts/setupAppTest.ts'],
}
