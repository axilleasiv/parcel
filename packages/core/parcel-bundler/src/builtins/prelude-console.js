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

  if (process.argv[2] && process.argv[2] === 'dom') {
    require('repl-dom');
  }

  process.on('disconnect', function () {
    process.exit();
  });
})();

var $console = (function(){
  var inspect = require('util').inspect;
  var config = {
    errors: false
  };

  if (process.argv[3] && process.argv[3] === 'errors') {
    config.errors = true;
  }

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
      Object.keys(error).forEach(function (key) {
        jsonError[key] = error[key];
      });
      return jsonError;
    }
  }

  return {
    log: function () {
      var args = Array.prototype.slice.call(arguments);
      var obj = {
        type: 'console',
        line: args.pop(),
        values: inspect(args)
      }

      if (config.errors) {
        obj.error = errorToJson(new Error());
      }

      if (process.send) {
        process.send(obj);
      } else {
        console.log(obj);
      }
    },
    error: function (error) {
      if (process.send) {
        process.send({ type: 'error', error: errorToJson(error) });
      } else {
        console.log({ type: 'error', error: errorToJson(error) });
      }
    }
  };
})()
