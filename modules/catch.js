/**
 * A middleware that "catches" non-Errors that are thrown from the downstream
 * app and returns them instead. This can be useful for breaking out of a
 * nested promise chain, for example.
 *
 * Example:
 *
 *   mach.catch(function (conn) {
 *     throw 200;
 *   });
 */
function catchError(app) {
  return function (conn) {
    return conn.call(app).then(undefined, function (reason) {
      if (reason instanceof Error)
        throw reason;
      
      return reason;
    });
  };
}

module.exports = catchError;
