const getReplConfig = asset => {
  const rel = asset.id;
  const {cvVar, cvIncreaseCb, log, included, coverage} = asset.options.custom;

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
      require('@achil/babel-plugin-console'),
      {
        consoleName: log,
        rel
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
