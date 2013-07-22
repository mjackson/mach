var mach = require('../lib');

mach.serve(function (request) {
  if (Math.random() > 0.5) {
    throw new Error('boom!');
  }

  return 'Hello world!';
});
