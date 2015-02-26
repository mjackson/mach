"use strict";

/**
 * Returns a shallow copy of the properties of the given object,
 * filtered by the functions in propertyTypes.
 */
function filterProperties(object, propertyTypes) {
  var properties = {};

  var type, value;
  for (var property in object) {
    type = propertyTypes[property];

    if (typeof type === "function" && object.hasOwnProperty(property)) {
      value = type(object[property]);

      if (value !== undefined) properties[property] = value;
    }
  }

  return properties;
}

module.exports = filterProperties;