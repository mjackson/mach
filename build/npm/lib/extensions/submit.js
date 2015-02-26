"use strict";

var createContent = require("../multipart/createContent");

function forEach(list, callback) {
  for (var i = 0, len = list.length; i < len; ++i) callback.call(list, list[i], i, list);
}

function getFieldType(node) {
  return node.nodeName.toUpperCase() === "INPUT" ? node.type.toUpperCase() : "TEXT";
}

function addParam(params, name, value) {
  if (!params[name]) {
    params[name] = value;
  } else if (Array.isArray(params[name])) {
    params[name].push(value);
  } else {
    params[name] = [params[name], value];
  }
}

function getParams(form) {
  var params = {};

  forEach(form.elements, function (element) {
    if (!element.hasAttribute("name")) return;

    var name = element.name;
    var type = getFieldType(element);

    if (type === "FILE" && element.files.length > 0) {
      forEach(element.files, function (file) {
        addParam(params, name, file);
      });
    } else if (type !== "RADIO" && type !== "CHECKBOX" || element.checked) {
      addParam(params, name, element.value);
    }
  });

  return params;
}

module.exports = function (mach) {
  mach.extend(require("./client"));

  /**
   * Submits the given form as binary data via XMLHttpRequest using
   * the form's action, method, and encoding, and returns a promise for
   * the connection object. This function is able to submit forms as
   * either application/x-www-form-urlencoded or multipart/form-data.
   *
   * Note: Only GET and POST methods are supported, as per the HTML spec.
   * If you need to use another method, try using a hidden `_method` field
   * and mach.methodOverride on the server.
   *
   * See also http://www.w3.org/TR/html401/interact/forms.html#h-17.13.1
   */
  mach.submit = function (form) {
    var action = form.action;
    var method = form.method.toUpperCase();
    var contentType = form.enctype;
    var params = getParams(form);

    if (method === "GET") return mach.get({ url: action, params: params });

    if (contentType !== "multipart/form-data") return mach.post({ url: action, params: params });

    var boundary = "--------------------------------" + Date.now().toString(16);

    return mach.post({
      url: action,
      headers: {
        "Content-Type": contentType + "; boundary=" + boundary
      },
      content: createContent(params, boundary)
    });
  };
};