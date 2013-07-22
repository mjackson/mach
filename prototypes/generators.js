// To run this example you need to run node in harmony-compat mode.
// I've tested it with node 0.11.2 like this:
//   node --harmony prototypes/generators.js

var q = require('q');
var mach = require('../lib');

var app = q.async(function* (request) {
  var params = yield request.parseContent();
  return JSON.stringify(params);
});

mach.serve(app, 3000);
