import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importPlugin from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

// Feature modules stay reachable only through a published surface: identifiers, ORM entities for
// schema-level relations, and the Nest module. Aggregates and persistence internals remain private.
const FEATURE_MODULES = ['category', 'option', 'product'];

// Layers a given layer must never reach into. Dependencies point inward: types <- domain <- application <- infrastructure <- interface.
const OUTER_LAYERS = {
    types: ['domain', 'application', 'infrastructure', 'interface'],
    domain: ['application', 'infrastructure', 'interface'],
    application: ['infrastructure', 'interface'],
    infrastructure: ['interface'],
};

const crossModulePattern = name => ({
    group: FEATURE_MODULES.filter(other => other !== name).flatMap(other => [`@modules/features/${other}/domain/**`, `@modules/features/${other}/infrastructure/mappers/**`, `@modules/features/${other}/infrastructure/repositories/**`]),
    message: 'Reach another feature module only through its types, orm-entities, application, or module file.',
});

// Three levels up already leaves the module; the alias keeps such a hop visible.
const relativeEscapePattern = {
    group: ['../../../*', '../../../**'],
    message: 'Leaving a feature module by relative path is not allowed; import it via @modules.',
};

const outerLayerPattern = layer => ({
    group: OUTER_LAYERS[layer].map(outer => `**/${outer}/**`),
    message: `Dependencies point inward, so a file under ${layer} cannot import ${OUTER_LAYERS[layer].join(', ')}.`,
});

const restrictImports = patterns => ({ '@typescript-eslint/no-restricted-imports': ['error', { patterns }] });

// A later entry replaces the rule rather than merging into it, so each layer entry repeats the module patterns.
const featureModuleBoundaries = FEATURE_MODULES.flatMap(name => [
    {
        files: [`src/modules/features/${name}/**/*.ts`],
        rules: restrictImports([crossModulePattern(name), relativeEscapePattern]),
    },
    ...Object.keys(OUTER_LAYERS).map(layer => ({
        files: [`src/modules/features/${name}/${layer}/**/*.ts`],
        rules: restrictImports([crossModulePattern(name), relativeEscapePattern, outerLayerPattern(layer)]),
    })),
]);

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
    ...featureModuleBoundaries,
    globalIgnores(['dist', 'coverage', 'logs']),
]);
