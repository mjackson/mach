module.exports = function (mach) {
  mach.extend(
    require('./accept'),
    require('./acceptCharset'),
    require('./acceptEncoding'),
    require('./acceptLanguage'),
    require('./client'),
    require('./fs'),
    require('./multipart'),
    require('./proxy'),
    require('./server'),
    require('./statusText')
  );
};
