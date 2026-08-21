const jestConfig = {
    rootDir: '.',
    testEnvironment: 'node',
    // Nest decorators write metadata at module load, so the shim has to be in place before any spec is required.
    setupFiles: ['reflect-metadata'],
    testRegex: '\\.(spec|e2e-spec)\\.ts$',
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
        // uuid ships ESM only. Node can require() it, jest's CommonJS registry cannot, so it is compiled here.
        '^.+\\.js$': ['ts-jest', { tsconfig: { allowJs: true, module: 'commonjs', target: 'ES2022' } }],
    },
    transformIgnorePatterns: ['/node_modules/(?!(\\.pnpm/)?uuid)'],
    // tsconfig "paths" is not read by jest's resolver.
    moduleNameMapper: {
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@common/(.*)$': '<rootDir>/src/common/$1',
        '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    },
    collectCoverageFrom: ['src/**/*.ts'],
};

export default jestConfig;
