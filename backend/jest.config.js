/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@clients/(.*)$': '<rootDir>/../../apiConnector/src/clients/$1',
    '^@dto/(.*)$': '<rootDir>/../../apiConnector/dto/$1',
    '^@base/(.*)$': '<rootDir>/../../apiConnector/src/base/$1',
    '^@auth/(.*)$': '<rootDir>/../../apiConnector/auth/$1',
  },
};
