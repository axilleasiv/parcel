let files = {};

const memFS = {
  set(path, contents) {
    files[path] = contents;
  },

  get(path) {
    return files[path];
  },

  remove(path) {
    if (files[path]) {
      files[path] = null;
    }
  },

  clear() {
    files = {};

    return files;
  },

  fs() {
    return files;
  }
};

module.exports = memFS;
