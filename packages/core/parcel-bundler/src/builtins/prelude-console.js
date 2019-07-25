(function() {
  var Module = require('module').Module;
  var origin_nodeModulePaths = Module._nodeModulePaths;

  var rootDir = process.cwd();
  var dirPaths = origin_nodeModulePaths(rootDir).filter(function(dirPath) {
    return module.paths.indexOf(dirPath) === -1;
  });

  if (require.main && require.main.paths) {
    require.main.paths = dirPaths.concat(require.main.paths);
  }

  Module._nodeModulePaths = function(from) {
    var paths = origin_nodeModulePaths.call(this, from);
    var extraPaths = dirPaths.filter(function(dirPath) {
      return paths.indexOf(dirPath) === -1;
    });

    paths = paths.concat(extraPaths);

    return paths;
  };

  var envRepl = JSON.parse(process.env.jsRepl);

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

    require(envRepl.dom)(config);
  }

  process.on('disconnect', function() {
    process.exit();
  });

  global['$console' + envRepl.cvVar] = (function() {
    var inspect = require('util').inspect;
    var cvVar = envRepl.cvVar;
    var cvInitial = false;
    var asyncEnd;

    if (envRepl.test) {
      asyncEnd = require(envRepl.test);
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
        Object.keys(error).forEach(function(key) {
          jsonError[key] = error[key];
        });
        return jsonError;
      }
    }

    return {
      log: function() {
        var args = Array.prototype.slice.call(arguments);
        var obj = {
          type: 'console',
          line: args.pop(),
          values: inspect(args)
        };

        process.send(obj);
      },
      error: function(error) {
        process.send({ type: 'error', error: errorToJson(error) });
      },
      covLog: function(obj) {
        var cov;
        if ((cov = global[cvVar])) {
          if (!cvInitial) {
            process.send({ type: 'cov', cov: cov });
            cvInitial = true;

            if (envRepl.test) {
              process.send({ type: 'end', kind: 'sync' });
              asyncEnd.check(50).then(function() {
                process.send({ type: 'end', kind: 'async' });
              });
            }
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
        });
      }
    };
  })();
})();
