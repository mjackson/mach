var mach = require('../index');

require('../accept');
require('../multipart');

mach.bind             = require('../utils/bindApp');
mach.serve            = require('../utils/serveApp');

mach.basicAuth        = require('../basicAuth');
mach.catch            = require('../catch');
mach.charset          = require('../charset');
mach.contentType      = require('../contentType');
mach.favicon          = require('../favicon');
mach.file             = require('../file');
mach.gzip             = require('../gzip');
mach.logger           = require('../logger');
mach.mapper           = require('../mapper');
mach.methodOverride   = require('../methodOverride');
mach.modified         = require('../modified');
mach.params           = require('../params');
mach.proxy            = require('../proxy');
mach.rewrite          = require('../rewrite');
mach.router           = require('../router');
mach.session          = require('../session');
mach.stack            = require('../stack');
mach.token            = require('../token');

Object.defineProperties(
  mach.Connection.prototype,
  require('./ConnectionProperties')
);

Object.defineProperties(
  mach.Message.prototype,
  require('./MessageProperties')
);

module.exports = mach;
