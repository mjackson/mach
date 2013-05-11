var utils = require('./utils');
var mapperMiddleware = require('./mapper');
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
function urlMap(app, map) {
  if (typeof app !== 'function') {
    map = app;
    app = utils.defaultApp;
  }

  var mapper = mapperMiddleware(app);

  for (var location in map) {
    mapper.map(location, map[location]);
  }

  return mapper;
}
