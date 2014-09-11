var d = require('d');
var mergeProperties = require('./utils/mergeProperties');

module.exports = {

  /**
   * True if this request was made using XMLHttpRequest.
   */
  isXHR: d.gs(function () {
    return this.headers['X-Requested-With'] === 'XMLHttpRequest';
  }),

  /**
   * The IP address of the client.
   */
  remoteHost: d.gs(function () {
    return this.headers['X-Forwarded-For'] || this._remoteHost;
  }),

  /**
   * A high-level method that returns a promise for an object that is the union of
   * data contained in the request query and body.
   *
   *   var maxUploadLimit = Math.pow(2, 20); // 1 mb
   *
   *   function app(request) {
   *     return request.getParams(maxUploadLimit).then(function (params) {
   *       // params is the union of query and content params
   *     });
   *   }
   *
   * Note: Content parameters take precedence over query parameters with the same name.
   */
  getParams: d(function (maxLength, uploadPrefix) {
    if (this._params)
      return this._params;

    var queryParams = mergeProperties({}, this.query);

    this._params = this.parseContent(maxLength, uploadPrefix).then(function (params) {
      // Content params take precedence over query params.
      return mergeProperties(queryParams, params);
    });

    return this._params;
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
  })

};
