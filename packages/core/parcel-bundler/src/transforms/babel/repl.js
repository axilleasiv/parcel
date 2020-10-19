const {logger} = require('@achil/babel-plugin-console');

const getReplConfig = asset => {
  const rel = asset.id;
  let {cvVar, cvIncreaseCb, log, included, coverage, doc, detectInfiniteLoops} = asset.options.vs;

  const plugins = [[require('@babel/plugin-proposal-class-properties')]];

  if (coverage && included.includes(rel)) {
    plugins.push([
      require('@achil/babel-plugin-istanbul'),
      {
        cvVar,
        cvIncreaseCb,
        rel
      }
    ]);
  }

  if (included.includes(rel)) {
    plugins.push([
      logger,
      {
        consoleName: log,
        detectInfiniteLoops,
        doc: {
          ...doc,
          rel,
        }
      }
    ]);
  }

  return {
    internal: true,
    babelVersion: 7,
    config: {
      plugins
    }
  };
};

module.exports = getReplConfig;
