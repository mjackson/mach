var mach = require('../lib');
var app = mach.stack();
var router = mach.router();

app.run(router);

app.use(mach.commonLogger);
app.use(mach.file, __dirname + '/..');
app.map('/protos', function (app) {
  app.use(mach.file, __dirname);
});

router.get('/', function (request) {
  return 'Hello world!';
});

mach.serve(app);
