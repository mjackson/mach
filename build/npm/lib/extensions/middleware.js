"use strict";

var middleware = require("../middleware");

module.exports = function (mach) {
  for (var property in middleware) if (middleware.hasOwnProperty(property)) mach[property] = middleware[property];
};