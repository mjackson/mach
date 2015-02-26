"use strict";

var Promise = require("./Promise");

function makeAbortable(promise, abort) {
  promise.abort = abort;

  // Hijack promise.then so it returns an abortable promise.
  var _then = promise.then;
  promise.then = function () {
    return makeAbortable(_then.apply(promise, arguments), abort);
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
  if (typeof resolver !== "function") throw new Error("AbortablePromise needs a resolver function");

  var abort;
  var promise = new Promise(function (resolve, reject) {
    var aborter;

    abort = function () {
      if (aborter == null) return;

      var fn = aborter;
      aborter = null;

      try {
        return fn.apply(this, arguments);
      } catch (error) {
        reject(error);
      }
    };

    resolver(function (child) {
      if (child && typeof child.abort === "function") {
        aborter = child.abort;
      } else {
        aborter = null;
      }

      resolve.apply(this, arguments);
    }, function () {
      aborter = null;
      reject.apply(this, arguments);
    }, function (fn) {
      if (typeof fn !== "function") throw new Error("onAbort needs a function");

      aborter = fn;
    });
  });

  return makeAbortable(promise, abort);
}

module.exports = AbortablePromise;