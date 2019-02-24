(function () {
  var Module = require('module').Module;
  var origin_nodeModulePaths = Module._nodeModulePaths;

  var dir = process.cwd();
  var dirPaths = origin_nodeModulePaths(dir).filter(function (dirPath) {
    return module.paths.indexOf(dirPath) === -1;
  });

  if (require.main && require.main.paths) {
    require.main.paths = dirPaths.concat(require.main.paths);
  }

  Module._nodeModulePaths = function (from) {
    var paths = origin_nodeModulePaths.call(this, from);
    var extraPaths = dirPaths.filter(function (dirPath) {
      return paths.indexOf(dirPath) === -1;
    });

    paths = paths.concat(extraPaths);

    return paths;
  };
})();

var inspect = require('util').inspect;

function errorToJson(error) {
  if (typeof error === 'string') {
    return { message: error };
  }

  if (error instanceof Error) {
    var jsonError = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
    // Add all custom codeFrame properties
    Object.keys(error).forEach(function(key) {
      jsonError[key] = error[key];
    });
    return jsonError;
  }
}

process.on('disconnect', function() {
  process.exit();
});

var $console = {
  log: function () {
    var args = Array.prototype.slice.call(arguments);
    var line = args.pop();

    if (process.send) {
      process.send({ type: 'console', line: line, values: inspect(args) });
    } else {
      console.log({ line: line, values: inspect(args) })
    }

  },
  error: function (error) {
    if (process.send) {
      process.send({ type: 'error', error: errorToJson(error) });
    } else {
      console.error({ type: 'error', error: errorToJson(error) })
    }
  }
};