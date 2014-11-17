var mach = require('../modules');
var app = mach.stack();

app.use(mach.logger);
app.use(mach.basicAuth, function (user, pass) {
  // Allow anyone to login, as long as they use the password "password".
  return pass == 'password';
});

app.run(function (conn) {
  return 'Hello ' + conn.remoteUser + '!';
});

mach.serve(app);
