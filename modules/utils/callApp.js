var Promise = require('bluebird').Promise;
var makeProxy = require('./makeProxy');
var Response = require('../Response');

function callApp(app, request) {
  app = app || request;

  if (typeof app !== 'function')
    app = makeProxy(app);

  var response = request._response;

  if (response == null)
    response = request._response = new Response;

  try {
    return Promise.resolve(app(request, response)).then(function (value) {
      if (value !== response && value != null) {
        if (value instanceof Response) {
          response = request._response = value;
        } else if (typeof value === 'number') {
          response.status = value;
        } else if (typeof value === 'string' || Buffer.isBuffer(value) || typeof value.pipe === 'function') {
          response.content = value;
        } else {
          if (value.status != null)
            response.status = value.status;

          if (value.headers != null)
            response.headers = value.headers;

          if (value.content != null)
            response.content = value.content;
        }
      }

      return response;
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = callApp;
