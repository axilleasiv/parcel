// custom: var nodeBuiltins = require('node-libs-browser');
var nodeBuiltins = {
  assert: 1,
  buffer: 1,
  child_process: null,
  cluster: null,
  console: 1,
  constants: 1,
  crypto: 1,
  dgram: null,
  dns: null,
  domain: 1,
  events: 1,
  fs: null,
  http: 1,
  https: 1,
  module: null,
  net: null,
  os: 1,
  path: 1,
  punycode: 1,
  process: 1,
  querystring: 1,
  readline: null,
  repl: null,
  stream: 1,
  _stream_duplex: 1,
  _stream_passthrough: 1,
  _stream_readable: 1,
  _stream_transform: 1,
  _stream_writable: 1,
  string_decoder: 1,
  sys: 1,
  timers: 1,
  tls: null,
  tty: 1,
  url: 1,
  util: 1,
  vm: 1,
  zlib: 1,
};

var builtins = Object.create(null);
for (var key in nodeBuiltins) {
  builtins[key] = nodeBuiltins[key] == null
    ? require.resolve('./_empty.js')
    : nodeBuiltins[key];
}

builtins['_bundle_loader'] = require.resolve('./bundle-loader.js');
builtins['_css_loader'] = require.resolve('./css-loader.js');

// custom:
module.exports = {
  builtins: builtins,
  nodeBuiltins: nodeBuiltins
}
