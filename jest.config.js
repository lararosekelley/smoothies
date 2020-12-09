module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  roots: ['<rootDir>/src/'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
  setupFiles: ['dotenv/config'],
  testPathIgnorePatterns: ['<rootDir>[/\\\\](node_modules|.next)[/\\\\]'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  preset: 'ts-jest',
};
