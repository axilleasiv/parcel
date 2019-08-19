let files = {};

const memFS = {
  set(path, contents) {
    files[path] = contents;
  },

  get(path) {
    return files[path];
  },

  remove(path) {
    delete files[path];
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
