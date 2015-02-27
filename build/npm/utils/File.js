"use strict";

function File(properties) {
  this.path = properties.path;
  this.name = properties.name;
  this.type = properties.type;
  this.size = properties.size;
}

module.exports = File;