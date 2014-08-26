var bodec = require('bodec');

var coders = {
  base64: bodec.fromBase64,
  hex: bodec.fromHex,
  raw: bodec.fromRaw,
  utf8: bodec.fromUnicode,
  'utf-8': bodec.fromUnicode
};

function binaryFrom(string, encoding) {
  return ((encoding && coders[encoding]) || coders.raw)(string);
}

module.exports = binaryFrom;
