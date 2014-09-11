var mach = require('../index');

require('../accept');
require('../multipart');

Object.defineProperties(
  mach.Message.prototype,
  require('./MessageProperties')
);

Object.defineProperties(
  mach.Request.prototype,
  require('./RequestProperties')
);

Object.defineProperties(
  mach.Response.prototype,
  require('./ResponseProperties')
);

mach.basicAuth        = require('./basicAuth');
mach.catch            = require('./catch');
mach.contentType      = require('./contentType');
mach.favicon          = require('./favicon');
mach.file             = require('./file');
mach.forward          = require('./forward');
mach.gzip             = require('./gzip');
mach.logger           = require('./logger');
mach.mapper           = require('./mapper');
mach.methodOverride   = require('./methodOverride');
mach.modified         = require('./modified');
mach.params           = require('./params');
mach.rewrite          = require('./rewrite');
mach.router           = require('./router');
mach.session          = require('./session');
mach.stack            = require('./stack');
mach.token            = require('./token');

mach.CookieStore      = require('./CookieStore');
mach.MemoryStore      = require('./MemoryStore');
mach.RedisStore       = require('./RedisStore');

mach.bind             = require('./utils/bindApp');
mach.map              = require('./utils/createMapper');
mach.serve            = require('./utils/serveApp');

module.exports = mach;
