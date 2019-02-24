const fs = require('@parcel/fs');

exports.set = async (options, content) => {
  try {
    await fs.writeFile(options.memFile, content);
  } catch (err) {
    return null;
  }
};

exports.get = async options => {
  try {
    const contents = await fs.readFile(options.memFile, 'utf8');

    return contents;
  } catch (err) {
    return null;
  }
};
