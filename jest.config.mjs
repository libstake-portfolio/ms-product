const jestConfig = {
    rootDir: '.',
    testEnvironment: 'node',
    // Nest decorators write metadata at module load, so the shim has to be in place before any spec is required.
    setupFiles: ['reflect-metadata'],
    testRegex: '\\.(spec|e2e-spec)\\.ts$',
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
        // Some dependencies ship ESM only. Node can require() them, jest's CommonJS registry cannot,
        // so they are compiled here.
        '^.+\\.js$': ['ts-jest', { tsconfig: { allowJs: true, module: 'commonjs', target: 'ES2022' } }],
    },
    transformIgnorePatterns: ['/node_modules/(?!(\\.pnpm/)?(uuid|htmlparser2|domhandler|domutils|dom-serializer|domelementtype|entities)[/@])'],
    // tsconfig "paths" is not read by jest's resolver.
    moduleNameMapper: {
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@common/(.*)$': '<rootDir>/src/common/$1',
        '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    },
    collectCoverageFrom: ['src/**/*.ts'],
};

export default jestConfig;
