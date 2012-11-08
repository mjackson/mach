var Q = require("q");
var HTTP = require("http");
var FS = require("fs");
var BufferedStream = require("bufferedstream");

var MACH = exports;

MACH.Server = Server;
function Server(app) {
    return HTTP.createServer(function (nodeRequest, nodeResponse) {
        var request = makeRequest(nodeRequest);
        request.call(app).then(function (response) {
            nodeResponse.writeHead(response.status, response.headers);
            response.content.pipe(nodeResponse);
            response.content.resume();
        }, function (error) {
            console.log(error.stack || error);
            nodeResponse.writeHead(500);
            nodeResponse.end();
        });
    });
}

// This method coerces a node HTTP ServerRequest to a mach.Request. This way
// we're decoupled from the core node API and more resilient to change.
function makeRequest(nodeRequest) {
    var params = {};
    params.method = nodeRequest.method;
    params.path = nodeRequest.url;
    params.headers = nodeRequest.headers;
    params.content = nodeRequest;
    return new Request(params);
}

// The Request object is a generic wrapper for any HTTP request, incoming
// or outgoing.
MACH.Request = Request;
function Request(params) {
    this.method = (params.method || 'GET').toUpperCase();
    this.path = params.path || '/';
    this.headers = params.headers || {};
    this.content = params.content;
}

Request.prototype.call = function (app) {
    return Q.when(app(this), function (response) {
        if (typeof response === "object") {
            if (Array.isArray(response)) {
                response = {
                    status: response[0],
                    headers: response[1],
                    content: response[2],
                };
            }
        }
        else if (typeof response === "string") {
            response = { content: response };
        }
        else if (typeof response === "number") {
            response = { status: response.status };
        }

        if (response.status === undefined) {
            response.status = 200;
        }
        if (response.headers === undefined) {
            response.headers = {};
        }
        if (response.content === undefined) {
            response.content = "";
        }
        if (typeof response.content === "string") {
            response.content = new BufferedStream(response.content);
            response.content.pause();
        }

        return response;
    });
};

Request.prototype.send = function (params) {
    // This could be used to make a request to some URL, like http.request.
};

// We should include a "lint" module like Rack does to check for compliant apps/middleware
// Should we hook it into MACH.call if enabled?
// MACH.Lint = function (app) {
//     return function (request) {
//         return app(request);
//     };
// }

MACH.Favicon = Favicon;
function Favicon(app) {
    return function (request) {
        if (request.path === '/favicon.ico') return 404;
        return request.call(app);
    };
}

MACH.Log = Log;
function Log(app) {
    return function (request) {
        return request.call(app).then(function (response) {
            console.log(request.method, request.path, response.status, response.headers);
            return response;
        });
    };
}

MACH.URLMap = URLMap;
function URLMap(map) {
    return function (request) {
        var app = map[request.path];
        return app ? request.call(app) : 404;
    };
}
