var createRequest = require('./utils/createRequest');

/**
 * Creates a new Request using the given options and sends
 * it to the given target. Returns a promise for the response.
 */
function call(target, options) {
  return createRequest(options).send(target);
}

module.exports = call;
