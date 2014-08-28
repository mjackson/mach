// To see the effect from this example, refresh the page repeatedly.
// You'll get random "hello world"s and "internal server error"s, but
// the server won't crash.

var Promise = require('when').Promise;
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
