import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importPlugin from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

// Feature modules stay reachable only through a published surface: identifiers, domain events, ORM
// entities for schema-level relations, and the Nest module. Aggregates and persistence internals remain private.
//
// Declared in dependency order: a module may reach the ones before it and never the ones after. The side
// that defines what exists must not learn about the side that uses it, and a module can only be lifted out
// into a service of its own while its arrows point one way.
const FEATURE_MODULES = ['category', 'option', 'product'];

const upstreamOf = name => FEATURE_MODULES.slice(0, FEATURE_MODULES.indexOf(name));
const downstreamOf = name => FEATURE_MODULES.slice(FEATURE_MODULES.indexOf(name) + 1);

// Layers a given layer must never reach into. Dependencies point inward: types <- domain <- application <- infrastructure <- interface.
const OUTER_LAYERS = {
    types: ['domain', 'application', 'infrastructure', 'interface'],
    domain: ['application', 'infrastructure', 'interface'],
    application: ['infrastructure', 'interface'],
    infrastructure: ['interface'],
};

// What stays private in another feature module. Named one folder at a time rather than blocking `domain`
// as a whole: a deny list cannot carve an exception back out, and events have to stay reachable.
const PRIVATE_PATHS = ['domain/models', 'domain/repositories', 'domain/errors', 'infrastructure/mappers', 'infrastructure/repositories'];

// Events are what one module reacts to in another, but the domain layer is not the one reacting.
// Answering something that happened elsewhere is coordination, so it stays outside the domain.
const PRIVATE_PATHS_FOR_INNER_LAYERS = ['domain', 'infrastructure/mappers', 'infrastructure/repositories'];

const crossModulePattern = (name, privatePaths = PRIVATE_PATHS) => ({
    group: upstreamOf(name).flatMap(other => privatePaths.map(privatePath => `@modules/features/${other}/${privatePath}/**`)),
    message: 'Reach another feature module only through its types, events, orm-entities, application, or module file.',
});

// Nothing of a module declared later is reachable, whatever its published surface says.
const downstreamModulePattern = name => ({
    group: downstreamOf(name).map(other => `@modules/features/${other}/**`),
    message: 'Feature modules depend one way only; a module declared after this one is downstream and reaching it would close a loop.',
});

// A library under common keeps the shape of a package: one entry names its surface, so the
// files behind it stay free to move when the library is published from its own repository.
const libraryEntryPattern = {
    group: ['@common/libs/*/*', '@common/libs/*/**'],
    message: 'Reach a library through its entry only: @common/libs/<name>.',
};

// Three levels up already leaves the module; the alias keeps such a hop visible.
const relativeEscapePattern = {
    group: ['../../../*', '../../../**'],
    message: 'Leaving a feature module by relative path is not allowed; import it via @modules.',
};

const outerLayerPattern = layer => ({
    group: OUTER_LAYERS[layer].map(outer => `**/${outer}/**`),
    message: `Dependencies point inward, so a file under ${layer} cannot import ${OUTER_LAYERS[layer].join(', ')}.`,
});

// The first and last module have nothing upstream or downstream of them, and an empty group is not a valid pattern.
const restrictImports = patterns => ({ '@typescript-eslint/no-restricted-imports': ['error', { patterns: patterns.filter(pattern => pattern.group.length > 0) }] });

// A later entry replaces the rule rather than merging into it, so each layer entry repeats the module patterns.
// The two innermost layers do not get the events exception; everything outside them does.
const INNER_LAYERS = ['types', 'domain'];

const featureModuleBoundaries = FEATURE_MODULES.flatMap(name => [
    {
        files: [`src/modules/features/${name}/**/*.ts`],
        rules: restrictImports([crossModulePattern(name), downstreamModulePattern(name), relativeEscapePattern, libraryEntryPattern]),
    },
    ...Object.keys(OUTER_LAYERS).map(layer => ({
        files: [`src/modules/features/${name}/${layer}/**/*.ts`],
        rules: restrictImports([crossModulePattern(name, INNER_LAYERS.includes(layer) ? PRIVATE_PATHS_FOR_INNER_LAYERS : PRIVATE_PATHS), downstreamModulePattern(name), relativeEscapePattern, libraryEntryPattern, outerLayerPattern(layer)]),
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
            ...restrictImports([libraryEntryPattern]),
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
