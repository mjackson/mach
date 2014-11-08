var fs = require('fs');
var formatString = require('util').format;
var getFileStats = require('./utils/getFileStats');
var getMimeType = require('./utils/getMimeType');
var joinPaths = require('./utils/joinPaths');
var Promise = require('./utils/Promise');
require('./server');

var PAGE_TEMPLATE = [
  '<html>',
  '<head>',
  '<meta http-equiv="content-type" content="text/html; charset=utf-8" />',
  '<title>%s</title>',
  '<style type="text/css">',
  '  body { font: 14px Helvetica, Arial, sans-serif; padding: 0 10px; }',
  '  address { text-align: right; font-style: italic; }',
  '  table { width: 100%; }',
  '  tr.even { background: #f3f3f3; }',
  '  .name { text-align: left; }',
  '  .size, .type, .mtime { text-align: right; }',
  '</style>',
  '</head>',
  '<body>',
  '<h1>%s</h1>',
  '<hr>',
  '<table cellspacing="0" cellpadding="3">',
  '<tr>',
  '  <th class="name">Name</th>',
  '  <th class="size">Size</th>',
  '  <th class="type">Type</th>',
  '  <th class="mtime">Last Modified</th>',
  '</tr>',
  '%s',
  '</table>',
  '<hr>',
  '<address>%s/%s</address>',
  '</body>',
  '</html>'
].join('\n');

var ROW_TEMPLATE = [
  '<tr class="%s">',
  '  <td class="name"><a href="%s">%s</a></td>',
  '  <td class="size">%s</td>',
  '  <td class="type">%s</td>',
  '  <td class="mtime">%s</td>',
  '</tr>'
].join('\n');

function byteSizeFormat(size) {
  var tier = size > 0 ? Math.floor(Math.log(size) / Math.log(1024)) : 0;
  var n = size / Math.pow(1024, tier);

  if (tier > 0)
    n = Math.floor(n * 10) / 10; // Preserve only 1 digit after decimal.

  return String(n) + [ 'B', 'K', 'M', 'G', 'T' ][tier];
}

function generateListing(conn, root, pathname, basename) {
  return new Promise(function (resolve, reject) {
    var path = joinPaths(root, pathname);

    fs.readdir(path, function (error, files) {
      if (error)
        return reject(error);

      var rows = formatString(ROW_TEMPLATE, '', '../', 'Parent Directory', '', '', '');

      Promise.all(files.map(getFileStats)).then(function (statsArray) {
        var className = 'even';

        statsArray.forEach(function (stats, index) {
          if (stats == null)
            return; // Ignore broken symlinks!

          var file = files[index];
          var name = joinPaths(path, file);
          var url = [ basename, pathname, file ].join('/');
          var mtime = stats.mtime;

          var size, type;
          if (stats.isDirectory()) {
            size = '-';
            type = 'directory';
            url += '/';
            file += '/';
          } else {
            size = byteSizeFormat(stats.size);
            type = getMimeType(file);
          }

          rows += '\n' + formatString(ROW_TEMPLATE, className, url, file, size, type, mtime);

          className = (className === 'even') ? 'odd' : 'even';
        });

        var title = 'Index of ' + pathname;
        var content = formatString(PAGE_TEMPLATE, title, title, rows, 'mach', mach.version);

        resolve(content);
      }, reject);
    });
  });
}

/**
 * A middleware that responds to requests that target a directory with an HTML
 * page listing that directory's contents.
 */
function directory(app, root) {
  if (typeof root !== 'string')
    throw new Error('Invalid root directory');

  if (!fs.existsSync(root))
    throw new Error('Directory "' + root + '" does not exist');

  if (!fs.statSync(root).isDirectory())
    throw new Error('"' + root + '" is not a directory');

  return function (conn) {
    var basename = conn.basename;
    var pathname = conn.pathname;

    if (pathname.indexOf('..') !== -1)
      return conn.text(403, 'Forbidden');

    var path = joinPaths(root, pathname);

    return getFileStats(path).then(function (stats) {
      if (stats == null || !stats.isDirectory())
        return conn.call(app);

      return generateListing(conn, root, pathname, basename).then(function (html) {
        conn.html(html);
      });
    });
  };
}

module.exports = directory;
