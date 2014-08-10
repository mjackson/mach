var d = require('d');
var Proxy = require('./Proxy');

module.exports = {

  /**
   * Aborts an outgoing request that is currently in progress.
   */
  abort: d(function () {
    // TODO
  }),

  /**
   * Sends this request to the given URL and returns a promise
   * for the response. If no URL is given, the request is sent
   * to its own URL.
   */
  send: d(function (toURL) {
    return this.call(new Proxy(toURL || this));
  })

};
