(function() {
  const Module = require('module').Module;
  const origin_nodeModulePaths = Module._nodeModulePaths;

  const rootDir = process.cwd();
  const dirPaths = origin_nodeModulePaths(rootDir).filter(function(dirPath) {
    return module.paths.indexOf(dirPath) === -1;
  });

  if (require.main && require.main.paths) {
    require.main.paths = dirPaths.concat(require.main.paths);
  }

  Module._nodeModulePaths = function(from) {
    let paths = origin_nodeModulePaths.call(this, from);
    const extraPaths = dirPaths.filter(function(dirPath) {
      return paths.indexOf(dirPath) === -1;
    });

    paths = paths.concat(extraPaths);

    return paths;
  };

  process.on('disconnect', function() {
    process.exit();
  });

  const Logger = require(process.argv[2]);
  const mode = process.argv[3];
  const jsdom = process.argv[4];
  let sendLog = process.send;
  sendLog = sendLog.bind(process);

  Logger({rootDir, mode, jsdom }, sendLog, sendLog, true);
})();
