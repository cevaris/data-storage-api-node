module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // https://jestjs.io/docs/cli#--verbose
  verbose: true,
  // https://jestjs.io/docs/configuration#watchpathignorepatterns-arraystring
  watchPathIgnorePatterns: ["./dist"],
};
