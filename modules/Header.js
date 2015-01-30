var d = require('describe-property');
var normalizeHeaderName = require('./utils/normalizeHeaderName');

function Header(name, value) {
  this.name = name;
  this.value = value;
}

Object.defineProperties(Header.prototype, {

  name: d.gs(function () {
    return this._name;
  }, function (value) {
    this._name = normalizeHeaderName(value);
  }),

  toString: d(function () {
    return this.name + ': ' + this.value;
  })

});

module.exports = Header;
