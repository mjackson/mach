var mach = require('../lib');
var app = mach.router();

app.use(mach.commonLogger);
app.use(mach.file, __dirname + '/..');
app.map('/protos', mach.file(__dirname));

app.get('/', function (request) {
  return 'Hello world!';
});

mach.serve(app);
