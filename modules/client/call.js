var createRequest = require('./utils/createRequest');

/**
 * Creates a new Request using the given options and sends
 * it to the given app. Returns a promise for the response.
 */
function call(app, options) {
  return createRequest(options).call(app);
}

module.exports = call;
