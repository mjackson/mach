"use strict";

function makeParams(keys, values) {
  return keys.reduce(function (params, key, index) {
    var value = values[index];

    if (key === "splat") {
      if (Array.isArray(params.splat)) {
        params.splat.push(value);
      } else if ("splat" in params) {
        // Multiple "splat" keys make an array.
        params.splat = [params.splat, value];
      } else {
        params.splat = value;
      }
    } else {
      params[key] = value;
    }

    return params;
  }, {});
}

module.exports = makeParams;