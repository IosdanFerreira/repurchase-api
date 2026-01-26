import "reflect-metadata";

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

// Global test timeout
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Add any global cleanup here
});
