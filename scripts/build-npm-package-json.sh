#!/usr/bin/env node

var package = require('../package');

package.main = package.main.replace('modules/', '');
package.scripts = undefined;
package.devDependencies = undefined;

var browser = {};

for (var path in package.browser)
  browser[path.replace('modules/', '')] = package.browser[path].replace('modules/', '');

package.browser = browser;

console.log(
  JSON.stringify(package, null, 2)
);
