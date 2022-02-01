/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

const {
  resolve
} = require('path');

module.exports = {
  roots: ['<rootDir>'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  preset: "ts-jest",
  moduleNameMapper: {
    "^@/config/(.+)$": "<rootDir>/ts/config/$1",
    "^@/constants/(.+)$": "<rootDir>/ts/constants/$1",
    "^@/contracts/(.+)$": "<rootDir>/ts/contracts/$1",
    "^@/controllers/(.+)$": "<rootDir>/ts/controllers/$1",
    "^@/database/(.+)$": "<rootDir>/ts/database/$1",
    "^@/drivers/(.+)$": "<rootDir>/ts/drivers/$1",
    "^@/graphql/(.+)$": "<rootDir>/ts/graphql/$1",
    "^@/jobs/(.+)$": "<rootDir>/ts/jobs/$1",
    "^@/lib/(.+)$": "<rootDir>/ts/lib/$1",
    "^@/schemas/(.+)$": "<rootDir>/ts/schemas/$1",
    "^@/socket.io/(.+)$": "<rootDir>/ts/socket.io/$1",
    "^@/templates/(.+)$": "<rootDir>/ts/templates/$1",
    "^@/test/(.+)$": "<rootDir>/ts/test/$1",
    "^@/utils/(.+)$": "<rootDir>/ts/utils/$1"
  },
  setupFiles: [resolve(__dirname, './ts/test/setup-test.ts')],
  testMatch: [
    "**/**/*.spec.ts",
  ],
};
