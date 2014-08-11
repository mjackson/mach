var mach = require('../proxy');

mach.call = require('./call');

var callUsingMethod = require('./utils/callUsingMethod');

mach.delete   = callUsingMethod('DELETE');
mach.get      = callUsingMethod('GET');
mach.head     = callUsingMethod('HEAD');
mach.options  = callUsingMethod('OPTIONS');
mach.patch    = callUsingMethod('PATCH');
mach.post     = callUsingMethod('POST');
mach.put      = callUsingMethod('PUT');

module.exports = mach;
