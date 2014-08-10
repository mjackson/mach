/**
 * The default mach app.
 */
function defaultApp(request) {
  return {
    status: 404,
    headers: {
      'Content-Type': 'text/plain'
    },
    content: 'Not Found: ' + request.method + ' ' + request.path
  };
}

module.exports = defaultApp;
