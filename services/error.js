'use strict';

module.exports = function(message, options) {
  let err = new Error(message);
  if( options.name ) { err.name = options.name; }
  Object.keys(options).forEach((key) => {
    if( key == 'name' ) { return; }
    err[key] = options[key];
  })
  return err;
}
