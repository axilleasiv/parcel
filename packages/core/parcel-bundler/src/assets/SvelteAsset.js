// https://github.com/DeMoorJasper/parcel-plugin-svelte/tree/master/packages/parcel-plugin-svelte
const path = require('path');
const Asset = require('../Asset');
const localRequire = require('../utils/localRequire');
const generateName = input => {
  let name = path
    .basename(input)
    .replace(path.extname(input), '')
    .replace(/[^a-zA-Z_$0-9]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/^(\d)/, '_$1');

  name = name[0].toUpperCase() + name.slice(1);
};

class SvelteAsset extends Asset {
  constructor(name, pkg, options) {
    super(name, pkg, options);
    this.type = 'js';
  }

  async getConfig() {
    const customOptions =
      (await super.getConfig(['.svelterc', 'svelte.config.js'], {
        packageKey: 'svelte'
      })) || {};

    // Settings for the compiler that depend on parcel.
    const parcelCompilerOptions = {
      filename: this.relativeName,
      name: generateName(this.relativeName),
      dev: !this.options.production
    };

    // parcelCompilerOptions will overwrite the custom ones,
    // because otherwise it can break the compilation process.
    // Note: "compilerOptions" is deprecated and replaced by compiler.
    // Since the depracation didnt take effect yet, we still support the old way.
    const compiler = {
      ...customOptions.compilerOptions,
      ...customOptions.compiler,
      ...parcelCompilerOptions
    };
    const preprocess = customOptions.preprocess;

    return {compiler, preprocess};
  }

  async generate() {
    const config = await this.getConfig();
    let {compile, preprocess} = await localRequire(
      'svelte/compiler.js',
      this.name
    );

    if (config.preprocess) {
      const preprocessed = await preprocess(this.contents, config.preprocess, {
        filename: config.compiler.filename
      });
      this.contents = preprocessed.toString();
    }

    const {js, css} = compile(this.contents, config.compiler);

    if (this.options.sourceMaps) {
      js.map.sources = [this.relativeName];
      js.map.sourcesContent = [this.contents];
    }

    const parts = [
      {
        type: 'js',
        value: js.code,
        sourceMap: this.options.sourceMaps ? js.map : undefined
      }
    ];

    if (css) {
      parts.push({
        type: 'css',
        value: css.code
      });
    }

    return parts;
  }

  async postProcess(generated) {
    //TODO:
    // Hacky fix to remove duplicate JS asset (Css HMR code)
    const filteredArr = generated.filter(part => part.type !== 'js');
    return [generated[0]].concat(filteredArr);
  }
}

module.exports = SvelteAsset;
