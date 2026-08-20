import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importPlugin from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

export default defineConfig([
    {
        extends: [...tsEslint.configs.recommended, prettierConfig],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.node,
        },
        plugins: {
            import: importPlugin,
            'unused-imports': unusedImports,
        },
        settings: {
            'import-x/resolver-next': [createTypeScriptImportResolver()],
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description' }],
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
            'no-console': 'warn',
            'import/no-unresolved': 'error',
            'import/order': [
                'warn',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    // tsconfig "paths" aliases resolve as bare specifiers; without this they
                    // are read as external packages.
                    pathGroups: [
                        { pattern: '@modules/**', group: 'internal' },
                        { pattern: '@configs/**', group: 'internal' },
                    ],
                    pathGroupsExcludedImportTypes: ['builtin'],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
        },
    },
    globalIgnores(['dist', 'coverage']),
]);
