module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    collectCoverageFrom: [
        'routes/**/*.js',
        'models/**/*.js',
        'middleware/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**'
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    testTimeout: 10000,
    verbose: true
};
