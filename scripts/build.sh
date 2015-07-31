#!/bin/bash -e

babel=node_modules/.bin/babel
build_dir=lib

rm -rf $build_dir

babel ./modules -d $build_dir
find -X $build_dir -type d -name __tests__ | xargs rm -rf

NODE_ENV=production webpack modules/index.js $build_dir/umd/mach.js
NODE_ENV=production webpack -p modules/index.js $build_dir/umd/mach.min.js

echo "gzipped, the UMD build is `gzip -c $build_dir/umd/mach.min.js | wc -c` bytes"
