var fs = require('fs');
var d = require('d');
var getMimeType = require('../utils/getMimeType');
var mergeProperties = require('../utils/mergeProperties');

module.exports = {

  /**
   * True if this request was made using XMLHttpRequest.
   */
  isXHR: d.gs(function () {
    return this.request.headers['X-Requested-With'] === 'XMLHttpRequest';
  }),

  /**
   * The IP address of the client.
   */
  remoteHost: d.gs(function () {
    return this.request.headers['X-Forwarded-For'] || this._remoteHost;
  }),

  /**
   * A high-level method that returns a promise for an object that is the union of
   * data contained in the request body and query string.
   *
   *   var maxUploadLimit = Math.pow(2, 20); // 1 mb
   *
   *   function app(conn) {
   *     return conn.getParams(maxUploadLimit).then(function (params) {
   *       // params is the union of query and request content params
   *     });
   *   }
   *
   * Note: Content parameters take precedence over query parameters with the same name.
   */
  getParams: d(function (maxLength, uploadPrefix) {
    var request = this.request;
    var queryParams = mergeProperties({}, this.query);

    return request.parseContent(maxLength, uploadPrefix).then(function (params) {
      // Content params take precedence over query params.
      return mergeProperties(queryParams, params);
    });
  }),

  /**
   * A high-level method that returns a promise for an object of all parameters given in
   * this request filtered by the filter functions given in the filterMap. This provides
   * a convenient way to get a whitelist of trusted request parameters.
   *
   * Keys in the filterMap should correspond to the names of request parameters and values
   * should be a filter function that is used to coerce the value of that parameter to the
   * desired output value. Any parameters in the filterMap that were not given in the request
   * are ignored. Values for which filtering functions return `undefined` are also ignored.
   *
   *   // This function parses a list of comma-separated values in
   *   // a request parameter into an array.
   *   function parseList(value) {
   *     return value.split(',');
   *   }
   *
   *   function app(request) {
   *     return request.filterParams({
   *       name: String,
   *       age: Number,
   *       hobbies: parseList
   *     }).then(function (params) {
   *       // params.name will be a string, params.age a number, and params.hobbies an array
   *       // if they were provided in the request. params won't contain any other properties.
   *     });
   *   }
   */
  filterParams: d(function (filterMap, maxLength, uploadPrefix) {
    return this.getParams(maxLength, uploadPrefix).then(function (params) {
      var filteredParams = {};

      var filter, value;
      for (var paramName in filterMap) {
        filter = filterMap[paramName];

        if (typeof filter === 'function' && params.hasOwnProperty(paramName)) {
          value = filter(params[paramName]);

          if (value !== undefined)
            filteredParams[paramName] = value;
        }
      }

      return filteredParams;
    });
  }),

  /**
   * Redirects the client to the given location. If status is not
   * given, it defaults to 302 Found.
   */
  redirect: d(function (status, location) {
    if (typeof status !== 'number') {
      location = status;
      status = 302;
    }

    this.status = status;
    this.response.headers['Location'] = location;
  }),

  /**
   * A quick way to write the status and/or content to the response.
   *
   * Examples:
   *
   *   conn.send(404);
   *   conn.send(404, 'Not Found');
   *   conn.send('Hello world');
   *   conn.send(fs.createReadStream('welcome.txt'));
   */
  send: d(function (status, content) {
    if (typeof status === 'number') {
      this.status = status;
    } else {
      content = status;
    }

    if (content != null)
      this.responseContent = content;
  }),

  /**
   * Sends the given text in a text/plain response.
   */
  text: d(function (status, text) {
    this.response.contentType = 'text/plain';
    this.send(status, text);
  }),

  /**
   * Sends the given HTML in a text/html response.
   */
  html: d(function (status, html) {
    this.response.contentType = 'text/html';
    this.send(status, html);
  }),

  /**
   * Sends the given JSON in an application/json response.
   */
  json: d(function (status, json) {
    this.contentType = 'application/json';

    if (typeof status === 'number') {
      this.status = status;
    } else {
      json = status;
    }

    if (json != null)
      this.responseContent = typeof json === 'string' ? json : JSON.stringify(json);
  }),

  /**
   * Sends a file to the client with the given options.
   *
   * Examples:
   *
   *   response.file('path/to/file.txt');
   *   response.file(200, 'path/to/file.txt');
   */
  file: d(function (status, options) {
    if (typeof status === 'number') {
      this.status = status;
    } else {
      options = status;
    }

    var response = this.response;

    if (typeof options === 'string')
      options = { path: options };

    if (options.content) {
      response.content = options.content;
    } else if (typeof options.path === 'string') {
      response.headers['Content-Length'] = fs.statSync(options.path).size;
      response.content = fs.createReadStream(options.path);
    } else {
      throw new Error('Missing file content/path');
    }

    if (options.type || options.path)
      response.headers['Content-Type'] = options.type || getMimeType(options.path);

    if (options.length || options.size)
      response.headers['Content-Length'] = options.length || options.size;
  })

};
