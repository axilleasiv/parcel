class Logger {
  constructor(options) {
    this.setOptions(options);
  }

  setOptions() {
    var func = function() {
      return;
    };

    this.log = func;
    this.error = func;
    this.warn = func;
    this.success = func;
    this.clear = func;
    this.progress = func;
    this.verbose = func;
  }
}
// custom: require('@parcel/logger');
module.exports = new Logger();
