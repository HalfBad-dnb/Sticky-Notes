/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js'
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.js',
    '<rootDir>/jest.setup.js'
  ],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  }
};
