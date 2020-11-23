const path = require('path');
const jsExt = ['.js', '.jsx', '.vue', '.svelte', '.mjs'];
const compiledExt = ['.ts', '.tsx', '.coffee'];
const allExt = jsExt.concat(compiledExt);

const isCompiled = id => {
  return compiledExt.some(ext => id.includes(ext));
};

const isSupportedFile = id => {
  return allExt.some(ext => id.includes(ext));
};

const isLoader = (extensionDir, name) => {
  const rel = path.relative(extensionDir, name);
  return rel[0] && rel[0] !== '.' && rel.indexOf('node_modules') === 0;
};

const isReplFile = (extensionDir, id, name) => {
  return !isLoader(extensionDir, name) && isSupportedFile(id);
};

const internalPackages = [
  'typescript',
  'coffeescript',
  'vue-template-compiler',
  '@vue/component-compiler-utils',
];

module.exports = {
  isLoader,
  isCompiled,
  isReplFile,
  internalPackages,
};
