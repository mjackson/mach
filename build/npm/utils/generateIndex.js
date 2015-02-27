"use strict";

var fs = require("fs");
var Promise = require("./Promise");
var getFileStats = require("./getFileStats");
var getMimeType = require("./getMimeType");
var formatByteSize = require("./formatByteSize");
var formatString = require("util").format;
var joinPaths = require("./joinPaths");

var MACH_VERSION = require("../version");

var PAGE_TEMPLATE = ["<html>", "<head>", "<meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\" />", "<title>%s</title>", "<style type=\"text/css\">", "  body { font: 14px Helvetica, Arial, sans-serif; padding: 0 10px; }", "  address { text-align: right; font-style: italic; }", "  table { width: 100%; }", "  tr.even { background: #f3f3f3; }", "  .name { text-align: left; }", "  .size, .type, .mtime { text-align: right; }", "</style>", "</head>", "<body>", "<h1>%s</h1>", "<hr>", "<table cellspacing=\"0\" cellpadding=\"3\">", "<tr>", "  <th class=\"name\">Name</th>", "  <th class=\"size\">Size</th>", "  <th class=\"type\">Type</th>", "  <th class=\"mtime\">Last Modified</th>", "</tr>", "%s", "</table>", "<hr>", "<address>%s/%s</address>", "</body>", "</html>"].join("\n");

var ROW_TEMPLATE = ["<tr class=\"%s\">", "  <td class=\"name\"><a href=\"%s\">%s</a></td>", "  <td class=\"size\">%s</td>", "  <td class=\"type\">%s</td>", "  <td class=\"mtime\">%s</td>", "</tr>"].join("\n");

function generateIndex(root, pathname, basename) {
  return new Promise(function (resolve, reject) {
    var path = joinPaths(root, pathname);

    fs.readdir(path, function (error, files) {
      if (error) return reject(error);

      var promises = files.map(function (file) {
        return getFileStats(joinPaths(path, file));
      });

      Promise.all(promises).then(function (statsArray) {
        var rows = formatString(ROW_TEMPLATE, "", "../", "Parent Directory", "", "", "");
        var className = "even";

        statsArray.forEach(function (stats, index) {
          if (stats == null) return; // Ignore broken symlinks!

          var file = files[index];
          var url = basename + pathname + file;
          var mtime = stats.mtime;

          var size, type;
          if (stats.isDirectory()) {
            size = "-";
            type = "directory";
            url += "/";
            file += "/";
          } else {
            size = formatByteSize(stats.size);
            type = getMimeType(file);
          }

          rows += "\n" + formatString(ROW_TEMPLATE, className, url, file, size, type, mtime);

          className = className === "even" ? "odd" : "even";
        });

        var title = "Index of " + basename + pathname;
        var content = formatString(PAGE_TEMPLATE, title, title, rows, "mach", MACH_VERSION);

        resolve(content);
      }, reject);
    });
  });
}

module.exports = generateIndex;