var fs = require('fs');
var mach = require('../lib');
var app = mach.stack();

app.use(mach.gzip);
app.use(mach.commonLogger);
app.use(mach.file, __dirname + '/..');

mach.serve(app, '/tmp/mach.sock');
