var mach = require('../lib'), app;

app = function (request) {
  return 'Hello world!';
};

app = mach.basicAuth(app, function (user, pass) {
  return user == 'user' && pass == 'pass';
});

app = mach.commonLogger(app);

mach.Server(app).listen(3333);
