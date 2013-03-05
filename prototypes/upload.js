var mach = require('../lib');
var stack = mach.stack();

stack.use(mach.contentType, 'text/html');
stack.use(mach.requestParams);

var app = mach.router();

app.get('/', function (request) {
  return [
    '<form method="POST" action="/" enctype="multipart/form-data">',
    '  <label for="file1">File 1:</label> <input type="file" name="file1" id="file1"><br>',
    '  <label for="file2">File 2:</label> <input type="file" name="file2" id="file2"><br>',
    '  <label for="file3">File 3:</label> <input type="file" name="file3" id="file3"><br>',
    '  <input type="submit">',
    '</form>'
  ].join('\n');
});

app.post('/', function (request) {
  return {
    headers: { 'Content-Type': 'text/plain' },
    content: JSON.stringify(request.params, null, 2)
  };
});

stack.run(app);

mach.serve(stack);
