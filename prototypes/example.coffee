mach = require "./mach"

server = mach.Server mach.Favicon mach.Log mach.URLMap

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

.listen 3333
