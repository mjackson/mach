var mapper = require('../mapper');

/**
 * Creates and returns a mach.mapper from the location/app pairs in `map`.
 *
 *   var app = mach.map({
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
function createMapper(map, defaultApp) {
  var m = mapper(defaultApp);

  for (var location in map) {
    if (map.hasOwnProperty(location))
      m.map(location, map[location]);
  }

  return m;
}

module.exports = createMapper;
