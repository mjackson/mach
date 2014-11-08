var mach = require('../modules');
var app = mach.stack();

app.use(mach.logger);

app.get('/', function () {
  return '<a href="/b">go to b</a>';
});

app.get('/b', function () {
  return '<a href="/c/' + Date.now() + '">go to c</a>';
});

app.get('/c/:id', function (conn) {
  return JSON.stringify({
    method: conn.method,
    location: conn.location,
    headers: conn.request.headers,
    params: conn.params
  }, null, 2);
});

mach.serve(app);
