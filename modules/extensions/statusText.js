var d = require('describe-property');
var StatusCodes = require('../StatusCodes');

module.exports = function (mach) {
  Object.defineProperties(mach.Connection.prototype, {

    /**
     * The message that corresponds with the response status code.
     */
    statusText: d.gs(function () {
      return this.status + ' ' + StatusCodes[this.status];
    })

  });
};
