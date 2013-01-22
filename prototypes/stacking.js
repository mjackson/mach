var mach = require('../lib');
var app = mach.stack();

app.use(mach.commonLogger);
app.use(mach.file, __dirname + '/..');

app.map('/protos', function (app) {
  app.use(function (app) {
    return function (request) {
      return request.call(app);
    };
  });

  app.use(mach.file, __dirname);
});

app.use(function (app) {
  return function (request) {
    return request.call(app).then(function (response) {
      response.headers['X-After-Map'] = 'true';
      return response;
    });
  };
});

mach.serve(app);
