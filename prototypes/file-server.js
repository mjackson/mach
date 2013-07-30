var mach = require('../lib');
var app = mach.stack();

app.use(mach.gzip);
app.use(mach.logger);
app.use(mach.modified);
app.use(mach.file, {
  root: __dirname + '/..',
  useLastModified: true,
  useEtag: true
});

mach.serve(app);
