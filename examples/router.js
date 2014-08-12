var mach = require('../modules');
var app = mach.stack();

app.use(mach.logger);
app.use(mach.file, __dirname + '/..');
app.map('/ex', function (app) {
  app.use(mach.file, __dirname);
});

app.get('/', function (request) {
  return 'Hello world!';
});

app.get('/motd', function (request) {
  return 'Do not go where the path may lead, go instead where there is no path and leave a trail.';
});

mach.serve(app);
