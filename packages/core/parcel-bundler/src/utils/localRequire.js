const {dirname, join} = require('path');
const {promisify} = require('@parcel/utils');
const resolve = promisify(require('resolve'));
const installPackage = require('./installPackage');
const getModuleParts = require('./getModuleParts');
const {internalPackages} = require('./repl')

const cache = new Map();

async function localRequire(name, path, triedInstall = false, internalDir) {
  let [resolved] = await localResolve(name, path, triedInstall, internalDir);
  return require(resolved);
}

async function localResolve(name, path, triedInstall = false, internalDir) {
  let basedir = dirname(path);
  let key = basedir + ':' + name;
  let resolved = cache.get(key);
  if (!resolved) {
    try {
      resolved = await resolve(name, {
        basedir,
        paths: internalDir ? [join(internalDir, 'node_modules')] : [],
      });
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && !triedInstall) {

        const packageName = getModuleParts(name)[0];
        if (internalDir) {
          await installPackage(packageName, path, internalDir);
          return localResolve(name, path, true, internalDir);
        } else {
          await installPackage(packageName, path);
          return localResolve(name, path, true);
        }

      }
      throw e;
    }

    cache.set(key, resolved);
  }

  return resolved;
}

localRequire.resolve = localResolve;
module.exports = localRequire;
