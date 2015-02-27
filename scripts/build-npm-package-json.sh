#!/usr/bin/env node

var package = require('../package');

package.main = package.main.replace('modules', 'lib');
package.scripts = undefined;
package.devDependencies = undefined;

var browser = {};

for (var path in package.browser)
  browser[path.replace('modules', 'lib')] = package.browser[path].replace('modules', 'lib');

package.browser = browser;

console.log(
  JSON.stringify(package, null, 2)
);
