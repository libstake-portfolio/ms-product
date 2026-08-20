const lintStagedConfig = {
    '*.{ts,mts,cts,js,mjs,cjs}': ['eslint --max-warnings=0', 'prettier --check'],
    '*.{json,yaml,yml}': ['prettier --check'],
};
export default lintStagedConfig;
