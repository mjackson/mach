var d = require('d');
var proxy = require('./proxy');

module.exports = {

  /**
   * Aborts an outgoing request that is currently in progress.
   */
  abort: d(function () {
    // TODO
  }),

  /**
   * Sends this request to the given target and returns a promise for the
   * response. If the target is not an app, it should be a string or options
   * hash that is used to create a proxy. If no target is given, the request
   * is sent to its own URL.
   */
  send: d(function (target) {
    target = target || this;

    if (typeof target !== 'function')
      target = proxy(target);

    return this.call(target);
  })

};
