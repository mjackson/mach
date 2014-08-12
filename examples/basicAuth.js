var mach = require('../modules')
var app = mach.stack();

app.use(mach.logger);
app.use(mach.basicAuth, function (user, pass) {
  return user == 'user' && pass == 'pass';
});

app.run(function (request) {
  return 'Hello world!';
});

mach.serve(app, 3333);
