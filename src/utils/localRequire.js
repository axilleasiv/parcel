const {dirname} = require('path');
const resolve = require('resolve');
const cache = new Map();

async function localRequire(name, path, internalVersion = false) {
  let basedir = dirname(path);
  let key = basedir + ':' + name;
  let resolved = cache.get(key);

  if (!resolved) {
    try {
      if (internalVersion) {
        resolved = name;
        cache.set(key, resolved);
      } else {
        resolved = resolve.sync(name, {basedir});
      }
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && !internalVersion) {
        // await worker.addCall({
        //   location: require.resolve('./installPackage.js'),
        //   args: [[name], path]
        // });
        return localRequire(name, path, true);
      }
      throw e;
    }
    cache.set(key, resolved);
  }

  return require(resolved);
}

module.exports = localRequire;
