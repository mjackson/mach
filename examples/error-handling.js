var when = require('when');
var mach = require('../modules');

mach.serve(function (request) {
  if (Math.random() > 0.5) {
    throw new Error('boom!');
  }

  var value = when.defer();

  setTimeout(function () {
    if (Math.random() > 0.8) {
      value.reject(new Error('deferred boom!'));
    }

    value.resolve('Hello world!');
  }, 100);

  return value.promise;
});
