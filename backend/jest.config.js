module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/server.ts", "!src/types/**/*.d.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true
};
