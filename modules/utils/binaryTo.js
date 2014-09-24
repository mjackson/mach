var bodec = require('bodec');

var coders = {
  base64: bodec.toBase64,
  hex: bodec.toHex,
  raw: bodec.toRaw,
  utf8: bodec.toUnicode,
  'utf-8': bodec.toUnicode
};

function binaryTo(binary, encoding) {
  return ((encoding && coders[encoding]) || coders.raw)(binary);
}

module.exports = binaryTo;
