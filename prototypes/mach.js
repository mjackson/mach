var Q = require("q");
var HTTP = require("http");
var FS = require("fs");
var BufferedStream = require("bufferedstream");

var MACH = exports;

MACH.Server = function Server(app) {
    return HTTP.createServer(function(nodeRequest, nodeResponse) {
        var request = nodeRequest;
        MACH.call(app, request).then(function(response) {
            nodeResponse.writeHead(response.status, response.headers);
            response.content.pipe(nodeResponse);
            response.content.resume();
        }, function(error) {
            console.log(error);
            nodeResponse.writeHead(500);
            nodeResponse.end();
        });
    });
};

// We should include a "lint" module like Rack does to check for compliant apps/middleware
// Should we hook it into MACH.call if enabled?
// MACH.Lint = function(app) {
//     return function(request) {
//         return app(request);
//     };
// }

// Simple MACH.call for handling immediate responses
MACH.call = function(app, request) {
    return Q.fcall(app, request);
};

// More coersion features for different response types
MACH.call = function(app, request) {
    return Q.when(app(request), function(response) {
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

MACH.Log = function(app) {
    return function(request) {
        console.log(request.url);
        return app(request);
    }
}

MACH.URLMap = function(map) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    return function(request) {
        if (hasOwnProperty.call(map, request.url)) {
            return MACH.call(map[request.url], request);
        } else {
            return 404;
        }
    };
}
