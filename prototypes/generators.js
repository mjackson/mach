var mach = require('../lib');
var app  = mach.stack();
var Q    = require('q');

function sleep(millis, answer) {
  const deferredResult = Q.defer();
  setTimeout(function() {
    deferredResult.resolve(answer);
  }, millis);
  return deferredResult.promise;
};

app.use(mach.commonLogger);

app.run(Q.async(function*(request) {
  var body = yield request.parseContent();

  console.log('Sleeping');
  yield sleep(200);

  return JSON.stringify(body);
}));

mach.serve(app, 3333);
