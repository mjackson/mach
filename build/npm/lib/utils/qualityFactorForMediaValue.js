"use strict";

/**
 * Returns the quality factor for the given media value object.
 */
function qualityFactorForMediaValue(value) {
  var qualityFactor = value.params && value.params.q;
  return qualityFactor ? parseFloat(qualityFactor) : 1;
}

module.exports = qualityFactorForMediaValue;