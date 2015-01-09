/* jshint -W058 */
var bodec = require('bodec');
var Stream = require('bufferedstream');
var Message = require('../Message');

// This parser is modified from the one in the node-formidable
// project, written by Felix Geisendörfer. MIT licensed.

var s = 0;
var S = {
  START: s++,
  START_BOUNDARY: s++,
  HEADER_FIELD_START: s++,
  HEADER_FIELD: s++,
  HEADER_VALUE_START: s++,
  HEADER_VALUE: s++,
  HEADER_VALUE_ALMOST_DONE: s++,
  HEADERS_ALMOST_DONE: s++,
  PART_DATA_START: s++,
  PART_DATA: s++,
  PART_END: s++,
  END: s++
};

var f = 1;
var F = {
  PART_BOUNDARY: f,
  LAST_BOUNDARY: f *= 2
};

var LF = 10;
var CR = 13;
var SPACE = 32;
var HYPHEN = 45;
var COLON = 58;

function Parser(boundary, partHandler) {
  this.boundary = bodec.fromRaw('\r\n--' + boundary);
  this.lookBehind = bodec.create(this.boundary.length + 8);
  this.boundaryChars = {};

  var i = this.boundary.length;
  while (i)
    this.boundaryChars[this.boundary[--i]] = true;

  this.state = S.START;
  this.index = null;
  this.flags = 0;

  if (typeof partHandler !== 'function')
    throw new Error('multipart.Parser needs a part handler');

  this.onPart = partHandler;
}

Parser.prototype.execute = function (chunk) {
  var chunkLength = chunk.length,
      prevIndex = this.index,
      index = this.index,
      state = this.state,
      flags = this.flags,
      lookBehind = this.lookBehind,
      boundary = this.boundary,
      boundaryChars = this.boundaryChars,
      boundaryLength = boundary.length,
      boundaryEnd = boundaryLength - 1,
      c,
      cl;

  for (var i = 0; i < chunkLength; ++i) {
    c = chunk[i];

    switch (state) {
    case S.START:
      index = 0;
      state = S.START_BOUNDARY;
      /* falls through */
    case S.START_BOUNDARY:
      if (index == boundaryLength - 2) {
        if (c != CR) {
          return i;
        }
        index++;
        break;
      } else if (index == boundaryLength - 1) {
        if (c != LF) {
          return i;
        }
        index = 0;
        this._callback('partBegin');
        state = S.HEADER_FIELD_START;
        break;
      }

      if (c != boundary[index + 2]) {
        return i;
      }
      index++;
      break;
    case S.HEADER_FIELD_START:
      state = S.HEADER_FIELD;
      this._mark('headerName', i);
      index = 0;
      /* falls through */
    case S.HEADER_FIELD:
      if (c == CR) {
        this._clear('headerName');
        state = S.HEADERS_ALMOST_DONE;
        break;
      }

      index++;
      if (c == HYPHEN) {
        break;
      }

      if (c == COLON) {
        if (index == 1) {
          // empty header field
          return i;
        }
        this._dataCallback('headerName', chunk, true, i);
        state = S.HEADER_VALUE_START;
        break;
      }

      cl = c | 0x20; // lower-case
      if (cl < 97 || cl > 122) { // not between "a" and "z"
        return i;
      }
      break;
    case S.HEADER_VALUE_START:
      if (c == SPACE) {
        break;
      }
      this._mark('headerValue', i);
      state = S.HEADER_VALUE;
      /* falls through */
    case S.HEADER_VALUE:
      if (c == CR) {
        this._dataCallback('headerValue', chunk, true, i);
        this._callback('headerEnd');
        state = S.HEADER_VALUE_ALMOST_DONE;
      }
      break;
    case S.HEADER_VALUE_ALMOST_DONE:
      if (c != LF) {
        return i;
      }
      state = S.HEADER_FIELD_START;
      break;
    case S.HEADERS_ALMOST_DONE:
      if (c != LF) {
        return i;
      }
      this._callback('headersEnd');
      state = S.PART_DATA_START;
      break;
    case S.PART_DATA_START:
      state = S.PART_DATA;
      this._mark('partData', i);
      /* falls through */
    case S.PART_DATA:
      prevIndex = index;

      if (index === 0) {
        // boyer-moore derrived algorithm to safely skip non-boundary data
        i += boundaryEnd;
        while (i < chunkLength && !(chunk[i] in boundaryChars)) {
          i += boundaryLength;
        }
        i -= boundaryEnd;
        c = chunk[i];
      }

      if (index < boundaryLength) {
        if (boundary[index] == c) {
          if (index === 0) {
            this._dataCallback('partData', chunk, true, i);
          }
          index++;
        } else {
          index = 0;
        }
      } else if (index == boundaryLength) {
        index++;
        if (c == CR) {
          // CR = part boundary
          flags |= F.PART_BOUNDARY;
        } else if (c == HYPHEN) {
          // HYPHEN = end boundary
          flags |= F.LAST_BOUNDARY;
        } else {
          index = 0;
        }
      } else if (index - 1 == boundaryLength) {
        if (flags & F.PART_BOUNDARY) {
          index = 0;
          if (c == LF) {
            // unset the PART_BOUNDARY flag
            flags &= ~F.PART_BOUNDARY;
            this._callback('partEnd');
            this._callback('partBegin');
            state = S.HEADER_FIELD_START;
            break;
          }
        } else if (flags & F.LAST_BOUNDARY) {
          if (c == HYPHEN) {
            this._callback('partEnd');
            // this._callback('end');
            state = S.END;
          } else {
            index = 0;
          }
        } else {
          index = 0;
        }
      }

      if (index > 0) {
        // when matching a possible boundary, keep a lookBehind
        // reference in case it turns out to be a false lead
        lookBehind[index - 1] = c;
      } else if (prevIndex > 0) {
        // if our boundary turned out to be rubbish, the captured
        // lookBehind belongs to partData
        this._callback('partData', lookBehind, 0, prevIndex);
        prevIndex = 0;
        this._mark('partData', i);

        // reconsider the current character even so it interrupted the
        // sequence it could be the beginning of a new sequence
        i--;
      }

      break;
    case S.END:
      break;
    default:
      return i;
    }
  }

  this._dataCallback('headerName', chunk);
  this._dataCallback('headerValue', chunk);
  this._dataCallback('partData', chunk);

  this.index = index;
  this.state = state;
  this.flags = flags;

  return chunkLength;
};

Parser.prototype.finish = function () {
  if (this.state !== S.END)
    throw new Error('Stream ended unexpectedly (state: ' + this.state + ')');
};

Parser.prototype._mark = function (name, i) {
  this[name + 'Mark'] = i;
};

Parser.prototype._clear = function (name) {
  delete this[name + 'Mark'];
};

Parser.prototype._callback = function (name, chunk, start, end) {
  if (start !== undefined && start === end)
    return;

  var prop = 'on' + name.substr(0, 1).toUpperCase() + name.substr(1);

  if (prop in this)
    this[prop](chunk, start, end);
};

Parser.prototype._dataCallback = function (name, chunk, clear, i) {
  var prop = name + 'Mark';

  if (prop in this) {
    if (!clear) {
      this._callback(name, chunk, this[prop], chunk.length);
      this[prop] = 0;
    } else {
      this._callback(name, chunk, this[prop], i);
      delete this[prop];
    }
  }
};

Parser.prototype.onPartBegin = function () {
  this._stream = new Stream;
  this._part = new Message(this._stream);
  this._headerName = '';
  this._headerValue = '';
};

Parser.prototype.onHeaderName = function (chunk, start, end) {
  this._headerName += bodec.toUnicode(chunk, start, end);
};

Parser.prototype.onHeaderValue = function (chunk, start, end) {
  this._headerValue += bodec.toUnicode(chunk, start, end);
};

Parser.prototype.onHeaderEnd = function () {
  this._part.setHeader(this._headerName, this._headerValue);
  this._headerName = '';
  this._headerValue = '';
};

Parser.prototype.onHeadersEnd = function () {
  this.onPart(this._part);
};

Parser.prototype.onPartData = function (chunk, start, end) {
  this._stream.write(bodec.slice(chunk, start, end));
};

Parser.prototype.onPartEnd = function () {
  this._stream.end();
};

module.exports = Parser;
