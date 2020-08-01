module.exports = {
  displayName: 'API',
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/scripts/setupApiTest.ts'],
  testMatch: ['<rootDir>/pages/api/**/__tests__/*.test.*'],
}
