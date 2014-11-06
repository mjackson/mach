function mergeProperties(object, a, b, c, d) {
  if (d != null)
    throw new Error('Too many arguments');

  [ a, b, c ].forEach(function (properties) {
    for (var property in properties)
      if (properties.hasOwnProperty(property))
        object[property] = properties[property];
  });

  return object;
}

module.exports = mergeProperties;
