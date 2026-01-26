module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/__test__"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__test__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "@modules/(.*)": "<rootDir>/src/modules/$1",
    "@shared/(.*)": "<rootDir>/src/shared/$1",
    "@config/(.*)": "<rootDir>/src/config/$1",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
    "!src/shared/database/migrations/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/__test__/setup.ts"],
};
