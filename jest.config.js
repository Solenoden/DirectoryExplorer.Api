module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: ['./**/*.ts'],
    coverageReporters: ['json', 'html'],
    coverageThreshold: {
        global: {
            statements: 60,
            branches: 60,
            functions: 60,
            lines: 60,
        },
    },
    modulePathIgnorePatterns: [
        'jest.config.js',
        'coverage',
        'dist'
    ]
}
