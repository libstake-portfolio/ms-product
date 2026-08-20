const jestConfig = {
    rootDir: '.',
    testEnvironment: 'node',
    testRegex: '\\.(spec|e2e-spec)\\.ts$',
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    // tsconfig "paths" is not read by jest's resolver.
    moduleNameMapper: {
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    },
    collectCoverageFrom: ['src/**/*.ts'],
};

export default jestConfig;
