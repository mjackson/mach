var mach = require('../lib'), app;

app = mach.file(__dirname + '/..');
app = mach.commonLogger(app);
app = mach.gzip(app);

mach.serve(app);
