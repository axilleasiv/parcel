const config = require('./config');
const {promisify} = require('@parcel/utils');
const resolve = promisify(require('resolve'));
const commandExists = require('command-exists');
const logger = require('./escapeLogger');
const pipeSpawn = require('./pipeSpawn');
const PromiseQueue = require('./PromiseQueue');
const path = require('path');
const fs = require('@parcel/fs');
const WorkerFarm = require('@achil/workers');
const {internalPackages} = require('./repl')

const YARN_LOCK = 'yarn.lock';

async function install(modules, filepath, internalDir, options = {}) {
  let {installPeers = true, saveDev = true, packageManager} = options;
  if (typeof modules === 'string') {
    modules = [modules];
  }

  logger.progress(`Installing ${modules.join(', ')}...`);

  let packageLocation = await config.resolve(filepath, ['package.json']);
  let cwd = (packageLocation && !internalDir) ? path.dirname(packageLocation) : internalDir;

  if (!packageManager) {
    packageManager = await determinePackageManager(filepath);
  }

  let commandToUse = packageManager === 'npm' ? 'install' : 'add';
  let args = [commandToUse, ...modules];
  if (saveDev) {
    args.push('-D');
  } else if (packageManager === 'npm') {
    args.push('--save');
  }

  // npm doesn't auto-create a package.json when installing,
  // so create an empty one if needed.
  if (packageManager === 'npm' && !packageLocation && !internalDir) {
    await fs.writeFile(path.join(cwd, 'package.json'), '{}');
  }

  try {
    await pipeSpawn(packageManager, args, {cwd});
  } catch (err) {
    throw new Error(`Failed to install ${modules.join(', ')}.`);
  }

  if (installPeers) {
    await Promise.all(
      modules.map(m => installPeerDependencies(filepath, m, internalDir, options))
    );
  }
}

async function installPeerDependencies(filepath, name, internalDir, options) {
  let basedir = path.dirname(filepath);
  const [resolved] = await resolve(name, {
    basedir,
    paths: internalDir ? [join(internalDir, 'node_modules')] : [],
  });
  const pkg = await config.load(resolved, ['package.json']);
  const peers = pkg.peerDependencies || {};

  const modules = [];
  for (const peer in peers) {
    modules.push(`${peer}@${peers[peer]}`);
  }

  //TODO: if there are dependencies internalDir, typescript, coffeescript peer deps
  if (modules.length) {
    await install(
      modules,
      filepath,
      Object.assign({}, options, {installPeers: false})
    );
  }
}

async function determinePackageManager(filepath) {
  const yarnLockFile = await config.resolve(filepath, [YARN_LOCK]);

  /**
   * no yarn.lock => use npm
   * yarn.lock => Use yarn, fallback to npm
   */
  if (!yarnLockFile) {
    return 'npm';
  }

  const hasYarn = await checkForYarnCommand();
  if (hasYarn) {
    return 'yarn';
  }

  return 'npm';
}

let hasYarn = null;
async function checkForYarnCommand() {
  if (hasYarn != null) {
    return hasYarn;
  }

  try {
    hasYarn = await commandExists('yarn');
  } catch (err) {
    hasYarn = false;
  }

  return hasYarn;
}

let queue = new PromiseQueue(install, {maxConcurrent: 1, retry: false});
module.exports = async function(...args) {
  // Ensure that this function is always called on the master process so we
  // don't call multiple installs in parallel.
  if (WorkerFarm.isWorker()) {
    await WorkerFarm.callMaster({
      location: __filename,
      args
    });
    return;
  }

  queue.add(...args);
  return queue.run();
};
