require('v8-compile-cache');
const Pipeline = require('./Pipeline');

let pipeline;

function init(options) {
  pipeline = new Pipeline(options || {});
  Object.assign(process.env, options.env || {});
  process.env.HMR_PORT = options.hmrPort;
  process.env.HMR_HOSTNAME = options.hmrHostname;
}

async function run(asset, isWarmUp) {
  try {
    return await pipeline.process(asset, isWarmUp);
  } catch (e) {
    e.fileName = asset.name;
    throw e;
  }
}

exports.init = init;
exports.run = run;
