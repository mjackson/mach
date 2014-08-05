var fs = require('fs');
var Promise = require('bluebird');

module.exports = Promise.promisify(fs.stat);
