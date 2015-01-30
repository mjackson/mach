var d = require('describe-property');
var Accept = require('../headers/Accept');

module.exports = function (mach) {
  Object.defineProperties(mach.Connection.prototype, {

    /**
     * Returns true if the request indicates that the client accepts
     * the given media type.
     */
    accepts: d(function (mediaType) {
      return this.request.accepts(mediaType);
    })

  });

  Object.defineProperties(mach.Message.prototype, {

    /**
     * Returns true if the client accepts the given media type.
     */
    accepts: d(function (mediaType) {
      if (!this._acceptHeader)
        this._acceptHeader = new Accept(this.headers['Accept']);

      return this._acceptHeader.accepts(mediaType);
    })

  });
};
