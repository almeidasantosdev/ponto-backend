/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      rootDir: 'src',
      testRegex: '\\.spec\\.ts$',
      testPathIgnorePatterns: ['/node_modules/', '/dist/'],
      transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
      },
      moduleFileExtensions: ['ts', 'js', 'json'],
    },
    {
      displayName: 'e2e',
      testEnvironment: 'node',
      rootDir: '.',
      testRegex: '\\.e2e-spec\\.ts$',
      testPathIgnorePatterns: ['/node_modules/', '/dist/'],
      transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
      },
      moduleFileExtensions: ['ts', 'js', 'json'],
    },
  ],
};
