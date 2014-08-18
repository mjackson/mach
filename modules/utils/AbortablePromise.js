var Promise = require('bluebird').Promise;

function makeAbortable(promise, onAbort) {
  promise.abort = onAbort;

  // Hijack promise.then so it returns an abortable promise.
  var _then = promise.then;
  promise.then = function () {
    return makeAbortable(_then.apply(promise, arguments), onAbort);
  };

  return promise;
}

/**
 * A Promise class with an abort() method that calls the onAbort function
 * provided by the resolver.
 *
 * Example:
 *
 *   var promise = new AbortablePromise(function (resolve, reject, onAbort) {
 *     // Use resolve & reject as you normally would.
 *     var request = makeRequest( ... , function (error, response) {
 *       if (error) {
 *         reject(error);
 *       } else {
 *         resolve(response);
 *       }
 *     });
 *   
 *     // Use onAbort to register a promise.abort() function. It is the
 *     // responsibility of this function to abort the execution of the
 *     // promise and resolve/reject as needed.
 *     onAbort(function () {
 *       request.abort();
 *       reject(new Error('Request was aborted'));
 *     });
 *   });
 *
 *   promise.abort(); // Calls the onAbort handler.
 */
function AbortablePromise(resolver) {
  if (typeof resolver !== 'function')
    throw new Error('AbortablePromise needs a resolver function');

  var abortHandler, onAbort;
  var promise = new Promise(function (resolve, reject) {
    resolver(function (child) {
      if (child && typeof child.abort === 'function') {
        abortHandler = child.abort;
      } else {
        abortHandler = null;
      }

      resolve.apply(this, arguments);
    }, function () {
      abortHandler = null;
      reject.apply(this, arguments);
    }, function (handler) {
      if (typeof handler !== 'function')
        throw new Error('onAbort needs a function');

      abortHandler = handler;
    });

    onAbort = function () {
      if (abortHandler == null)
        return;

      var handler = abortHandler;
      abortHandler = null;

      try {
        return handler.apply(this, arguments);
      } catch (error) {
        reject(error);
      }
    };
  });

  return makeAbortable(promise, onAbort);
}

module.exports = AbortablePromise;
