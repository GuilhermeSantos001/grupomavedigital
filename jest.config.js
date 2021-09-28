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
    "^@/app/(.+)$": "<rootDir>/ts/app/$1",
    "^@/graphql/(.+)$": "<rootDir>/ts/graphql/$1",
    "^@/bin/(.+)$": "<rootDir>/ts/bin/$1",
    "^@/controllers/(.+)$": "<rootDir>/ts/controllers/$1",
    "^@/core/(.+)$": "<rootDir>/ts/core/$1",
    "^@/db/(.+)$": "<rootDir>/ts/db/$1",
    "^@/drivers/(.+)$": "<rootDir>/ts/drivers/$1",
    "^@/middlewares/(.+)$": "<rootDir>/ts/middlewares/$1",
    "^@/mongo/(.+)$": "<rootDir>/ts/mongo/$1",
    "^@/routers/(.+)$": "<rootDir>/ts/routers/$1",
    "^@/utils/(.+)$": "<rootDir>/ts/utils/$1"
  },
  setupFiles: [resolve(__dirname, './ts/test/setup-test.ts')],
  testMatch: [
    "**/**/*.spec.ts",
  ],
};
