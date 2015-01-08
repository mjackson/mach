var objectAssign = require('object-assign');
var sendRequest = require('../utils/sendRequest');
var Location = require('../Location');

function defaultApp(conn) {
  return sendRequest(conn, conn.location);
}

module.exports = function (mach) {
  mach.call = require('../utils/callApp');

  [ 'DELETE',
    'GET',
    'HEAD',
    'OPTIONS',
    'POST',
    'PUT',
    'TRACE'
  ].forEach(function (method) {
    var property = method.toLowerCase();

    mach[property] = function (app, options, modifier) {
      if (typeof app !== 'function') {
        modifier = options;

        if (typeof app === 'string') { // get(url, modifier)
          options = { url: app };
        } else if (app instanceof Location) { // get(location, modifier)
          options = { location: app };
        } else { // get(options, modifier)
          options = objectAssign({}, app || {});
        }

        app = defaultApp;
      } else if (typeof options === 'string') { // get(app, url, modifier)
        options = { url: options };
      } else if (options instanceof Location) { // get(app, location, modifier)
        options = { location: options };
      } else if (typeof options !== 'object') { // get(app, modifier)
        modifier = options;
        options = {};
      } else { // get(app, options, modifier)
        options = objectAssign({}, options || {});
      }

      options.method = method;

      return mach.call(app, options, modifier);
    };
  });
};
