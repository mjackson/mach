mach = require "../lib"

server = mach.serve mach.logger mach.urlMap

    "/": -> '<a href="/foo">Foo</a>'

    "/foo": -> [200, {}, '<a href="/bar">Bar</a>']

    "/bar": (req) ->
        status: 200
        headers: "content-type": "application/json"
        content: JSON.stringify
            method: req.method
            path: req.path
            headers: req.headers
            , null, 2
