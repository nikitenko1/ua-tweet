const fs = require('fs');

const removeTmp = (path) => {
  // eslint-disable-next-line node/prefer-promises/fs
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

module.exports = removeTmp;
