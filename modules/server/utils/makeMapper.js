var Mapper = require('../mapper');

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
function makeMapper(map, defaultApp) {
  var mapper = new Mapper(defaultApp);

  for (var location in map) {
    if (map.hasOwnProperty(location))
      mapper.map(location, map[location]);
  }

  return mapper;
}

module.exports = makeMapper;
