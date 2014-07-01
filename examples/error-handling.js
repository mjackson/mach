var Promise = require('bluebird');
var mach = require('../modules');

mach.serve(function (request) {
  if (Math.random() > 0.5)
    throw new Error('boom!');

  var deferred = Promise.defer();

  setTimeout(function () {
    if (Math.random() > 0.8) {
      deferred.reject(new Error('deferred boom!'));
    } else {
      deferred.resolve('Hello world!');
    }
  }, 100);

  return deferred.promise;
});
