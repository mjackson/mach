var mach = require('../proxy');
var makeRequestMethod = require('./utils/makeRequestMethod');

mach.delete   = makeRequestMethod('DELETE');
mach.get      = makeRequestMethod('GET');
mach.head     = makeRequestMethod('HEAD');
mach.options  = makeRequestMethod('OPTIONS');
mach.patch    = makeRequestMethod('PATCH');
mach.post     = makeRequestMethod('POST');
mach.put      = makeRequestMethod('PUT');
mach.request  = require('./request');

module.exports = mach;
