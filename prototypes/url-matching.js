var mach = require('../lib');
var stack = mach.stack();
var router = mach.router();

stack.run(router);

stack.use(mach.logger);

router.get('/', function (request) {
  return '<a href="/b">go to b</a>';
});

router.get('/b', function (request) {
  return '<a href="/c/' + Date.now() + '">go to c</a>';
});

router.get('/c/:id', function (request) {
  var id = request.route.id;
  return JSON.stringify({
    method: request.method,
    path: request.path,
    url: request.url,
    headers: request.headers,
    id: id
  }, null, 2);
});

mach.serve(stack);
