/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.json',
        diagnostics: false,
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage-e2e',
  testEnvironment: 'node',
  testTimeout: 120000,
  moduleNameMapper: {
    '^@clients/(.*)$': '<rootDir>/../../apiConnector/src/clients/$1',
    '^@dto/(.*)$': '<rootDir>/../../apiConnector/dto/$1',
    '^@base/(.*)$': '<rootDir>/../../apiConnector/src/base/$1',
    '^@auth/(.*)$': '<rootDir>/../../apiConnector/auth/$1',
  },
  setupFiles: ['<rootDir>/../jest-e2e.setup.js'],
};
