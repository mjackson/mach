var utils = require('../utils');
var Mapper = require('./mapper');

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
module.exports = function (app, map) {
  if (!utils.isApp(app)) {
    map = app;
    app = utils.defaultApp;
  }

  var mapper = new Mapper(app);

  for (var location in map) {
    if (map.hasOwnProperty(location))
      mapper.map(location, map[location]);
  }

  return mapper;
};
