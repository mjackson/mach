var mach = require('../modules/server');

mach.serve(function (request) {
  return 'Hello world!';
});
