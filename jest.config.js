module.exports = {
    bail: true,
    automock: true,
    verbose: true,
    collectCoverage: true,
    coverageDirectory: "<rootDir>/coverage/",
    collectCoverageFrom: ["**/jest-tests/*.{tsx}", "!**/node_modules/**", "!**/dist/**"],
    setupFiles: ["<rootDir>/jest-tests/jestsetup.ts"],
    moduleNameMapper: {
        electron: "<rootDir>/jest-tests/mocks/electronMock.ts",
        PersistentSettings: "<rootDir>/jest-tests/mocks/PersistentSettings.ts",
        Utility: "<rootDir>/jest-tests/mocks/Utility.ts",
        Configuration: "<rootDir>/jest-tests/mocks/Configuration.ts",
        classnames: "<rootDir>/jest-tests/mocks/classnames.ts",
    },
    snapshotSerializers: ["enzyme-to-json/serializer"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    globals: {
        "ts-jest": {
            babelConfig: {
                env: {
                    test: {
                        plugins: ["dynamic-import-node"],
                    },
                },
            },
            tsConfigFile: "./jest-tests/tsconfig.react.json",
        },
    },
}
