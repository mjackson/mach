var normalizeHeaderName = require('./utils/normalizeHeaderName');

class Header {

  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = normalizeHeaderName(value);
  }

  toString() {
    return this.name + ': ' + this.value;
  }

}

module.exports = Header;
