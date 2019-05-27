(function () {
  var Module = require('module').Module;
  var origin_nodeModulePaths = Module._nodeModulePaths;

  var rootDir = process.cwd();
  var dirPaths = origin_nodeModulePaths(rootDir).filter(function (dirPath) {
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
    var config;
    var fs = require('fs');
    var path = require('path');
    var pkgPath = path.join(rootDir, 'package.json');
    var pkgPathExists = fs.existsSync(pkgPath);

    if (pkgPathExists) {
      try {
        var pkg = require(pkgPath);
        config = pkg.jsRepl;
      } catch (err) {
        process.send({ type: 'other', error: 'no package.json' });
      }
    }

    require('@achil/repl-dom')(config);
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
  var cvVar = JSON.parse(process.env.jsRepl).cvVar;
  var cvInitial = false;

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

      process.send(obj);
    },
    error: function (error) {
      process.send({ type: 'error', error: errorToJson(error) });
    },
    covLog: function(obj) {
      let cov;
      if (cov = global[cvVar]) {
        if (!cvInitial) {
          process.send({ type: 'cov', cov: cov });
          cvInitial = true;
        } else if (cvInitial && obj) {
          process.send({ type: 'cov', covAsync: obj });
        }
      }
    },
    cov: function(type, id, index) {
      if (!cvInitial) return;

      this.covLog({
        type: type,
        id: id,
        index: index
      })
    }
  };
})()
