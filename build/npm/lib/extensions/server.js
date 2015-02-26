"use strict";

var fs = require("fs");
var d = require("describe-property");
var objectAssign = require("object-assign");
var getMimeType = require("../utils/getMimeType");
var filterProperties = require("../utils/filterProperties");
var stringifyCookie = require("../utils/stringifyCookie");
var saveToDisk = require("../utils/saveToDisk");

module.exports = function (mach) {
  mach.bind = require("../utils/bindApp");
  mach.createConnection = require("../utils/createConnection");
  mach.serve = require("../utils/serveApp");

  Object.defineProperties(mach.Connection.prototype, {

    /**
     * True if the request uses XMLHttpRequest, false otherwise.
     */
    isXHR: d.gs(function () {
      return this.request.headers["X-Requested-With"] === "XMLHttpRequest";
    }),

    /**
     * A high-level method that returns a promise for an object that is the
     * union of parameters contained in the request body and query string.
     *
     * The paramTypes argument may be used to filter parameters. It functions
     * like a whitelist of acceptable parameters and increases the security of
     * your app by not returning any parameters that you do not specify.
     *
     *   // This function parses a list of comma-separated values in
     *   // a request parameter into an array.
     *   function parseList(value) {
     *     return value.split(',');
     *   }
     *
     *   function app(conn) {
     *     return conn.getParams({
     *       name: String,
     *       age: Number,
     *       hobbies: parseList
     *     }).then(function (params) {
     *       // params.name will be a string, params.age a number, and
     *       // params.hobbies an array if they were provided in the
     *       // request. params won't contain any other properties.
     *     });
     *   }
     *
     * Of course, paramTypes may be omitted entirely to get a hash of all parameters.
     * 
     * The maxLength argument is passed directly to the request's parseContent method.
     *
     *   var maxUploadLimit = Math.pow(2, 20); // 1 mb
     *
     *   function app(conn) {
     *     return conn.getParams(maxUploadLimit).then(function (params) {
     *       // params is the union of query and request content params
     *     });
     *   }
     *
     * Note: Content parameters take precedence over query parameters with the same name.
     */
    getParams: d(function (paramTypes, maxLength) {
      if (typeof paramTypes !== "object") {
        maxLength = paramTypes;
        paramTypes = null;
      }

      var request = this.request;
      var queryParams = objectAssign({}, this.query);

      return request.parseContent(maxLength).then(function (contentParams) {
        // Content params take precedence over query params.
        var params = objectAssign(queryParams, contentParams);
        return paramTypes ? filterProperties(params, paramTypes) : params;
      });
    }),

    /**
     * Redirects the client to the given location. If status is not
     * given, it defaults to 302 Found.
     */
    redirect: d(function (status, location) {
      if (typeof status !== "number") {
        location = status;
        status = 302;
      }

      this.status = status;
      this.response.headers.Location = location;
    }),

    /**
     * Redirects the client back to the URL they just came from, or
     * to the given location if it isn't known.
     */
    back: d(function (location) {
      this.redirect(this.request.headers.Referer || location || "/");
    }),

    /**
     * A quick way to write the status and/or content to the response.
     *
     * Examples:
     *
     *   conn.send(404);
     *   conn.send(404, 'Not Found');
     *   conn.send('Hello world');
     *   conn.send(fs.createReadStream('welcome.txt'));
     */
    send: d(function (status, content) {
      if (typeof status === "number") {
        this.status = status;
      } else {
        content = status;
      }

      if (content != null) this.response.content = content;
    }),

    /**
     * Sends the given text in a text/plain response.
     */
    text: d(function (status, text) {
      this.response.contentType = "text/plain";
      this.send(status, text);
    }),

    /**
     * Sends the given HTML in a text/html response.
     */
    html: d(function (status, html) {
      this.response.contentType = "text/html";
      this.send(status, html);
    }),

    /**
     * Sends the given JSON in an application/json response.
     */
    json: d(function (status, json) {
      this.response.contentType = "application/json";

      if (typeof status === "number") {
        this.status = status;
      } else {
        json = status;
      }

      if (json != null) this.response.content = typeof json === "string" ? json : JSON.stringify(json);
    }),

    /**
     * Sends a file to the client with the given options. The following
     * options are available:
     *
     * - content/path   The raw file content as a string, Buffer, stream, or
     *                  path to a file on disk
     * - type           The Content-Type of the file. Defaults to a guess based
     *                  on the file extension when a file path is given
     * - length/size    The Content-Length of the file, if it's known. Defaults
     *                  to the size of the file when a file path is given
     *
     * Examples:
     *
     *   response.file('path/to/file.txt');
     *   response.file(200, 'path/to/file.txt');
     */
    file: d(function (status, options) {
      if (typeof status === "number") {
        this.status = status;
      } else {
        options = status;
      }

      var response = this.response;

      if (typeof options === "string") options = { path: options };

      if (options.content) {
        response.content = options.content;
      } else if (typeof options.path === "string") {
        response.content = fs.createReadStream(options.path);
      } else {
        throw new Error("Missing file content/path");
      }

      if (options.type || options.path) response.headers["Content-Type"] = options.type || getMimeType(options.path);

      if (options.length || options.size) {
        response.headers["Content-Length"] = options.length || options.size;
      } else if (typeof options.path === "string") {
        response.headers["Content-Length"] = fs.statSync(options.path).size;
      }
    })

  });

  mach.extend(require("./multipart"));

  var _handlePart = mach.Message.prototype.handlePart;

  Object.defineProperties(mach.Message.prototype, {

    /**
     * Sets a cookie with the given name and options.
     */
    setCookie: d(function (name, options) {
      this.addHeader("Set-Cookie", stringifyCookie(name, options));
    }),

    /**
     * Override the multipart extension's Message#handlePart to enable
     * streaming file uploads to disk when parsing multipart messages.
     */
    handlePart: d(function (part) {
      return part.filename ? saveToDisk(part, "MachUpload-") : _handlePart.apply(this, arguments);
    })

  });
};