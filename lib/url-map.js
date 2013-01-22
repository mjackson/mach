var mapper = require('./mapper');

module.exports = urlMap;

/**
 * A middleware that provides host and/or location-based routing using a
 * mach.mapper created from the location/app pairs in the given `map`.
 *
 *   var app = mach.urlMap({
 *
 *     'http://example.com/images': function (request) {
 *       // The hostname used in the request was example.com, and the path
 *       // started with "/images".
 *     },
 *
 *     '/images': function (request) {
 *       // The request path started with "/images".
 *     }
 *
 *   });
 */
function urlMap(map, defaultApp) {
  var app = mapper(defaultApp);

  for (var location in map) {
    app.map(location, map[location]);
  }

  return app;
}
