function getByteLength(chunk) {
  if (typeof chunk.byteLength !== 'undefined')
    return chunk.byteLength;

  return chunk.length;
}

module.exports = getByteLength;
