'use strict';

module.exports = function(message, options) {
  let err = new Error(message);
  if( options.name ) { err.name = options.name; }
  return err;
}
