const path = require('path');
const fs = require('./fs');
const filename = 'temp-123456789';
let memPath;

exports.init = async cache => {
  memPath = path.join(cache.dir, filename);

  await cache.ensureDirExists();
};

exports.set = async content => {
  try {
    await fs.writeFile(memPath, content);
  } catch (err) {
    return null;
  }
};

exports.get = async () => {
  try {
    const contents = await fs.readFile(memPath, 'utf8');

    return contents;
  } catch (err) {
    return null;
  }
};
