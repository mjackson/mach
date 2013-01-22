var mach = require('../lib'), app;

app = mach.file(__dirname + '/..');
app = mach.commonLogger(app);

mach.Server(app).listen(3333);
