var Promise = require('bluebird').Promise;
var mach = require('../modules');

mach.serve(function (request) {
  if (Math.random() > 0.75)
    throw new Error('boom!');

  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (Math.random() > 0.75) {
        reject(new Error('deferred boom!'));
      } else {
        resolve('Hello world!');
      }
    }, 100);
  });
});
