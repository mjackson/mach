var mach = require('../modules');
var app = mach.stack();

app.use(mach.contentType, 'text/html');
app.use(mach.params);

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

app.post('/', function (request, response) {
  // Send a pretty-printed version of request.params.
  response.text(JSON.stringify(request.params, null, 2));
});

mach.serve(app);
