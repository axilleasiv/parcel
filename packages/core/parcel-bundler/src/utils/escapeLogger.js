class Logger {
  constructor(options) {
    this.setOptions(options);
  }

  setOptions() {
    var func = function(msg) {
      // console.log(msg);
      return;
    };

    this.log = func;
    this.error = func;
    this.warn = func;
    this.success = func;
    this.clear = func;
    this.progress = func;
    this.verbose = func;
    this.writeRaw = func;
  }
}
// custom: require('@parcel/logger');
module.exports = new Logger();
