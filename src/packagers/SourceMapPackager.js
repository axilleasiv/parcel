const path = require('path');
const Packager = require('./Packager');
const SourceMap = require('../SourceMap');

class SourceMapPackager extends Packager {
  async start() {
    this.sourceMap = new SourceMap();
  }

  async addAsset(asset) {
    await this.sourceMap.addMap(
      asset.generated.map,
      this.bundle.parentBundle.getOffset(asset)
    );
  }

  async end() {
    if (this.options.noFsReadWrite) {
      this.bundler.mainBundle.sourceMapFinal = this.sourceMap;
    } else {
      let file = path.basename(this.bundle.name);
      await this.write(
        this.sourceMap.stringify(
          file,
          path.relative(this.options.outDir, this.options.rootDir)
        )
      );
    }
    await super.end();
  }
}

module.exports = SourceMapPackager;
