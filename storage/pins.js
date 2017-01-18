'use strict';

const error = require('../services/error');

module.exports = {
  create: create,
}

let pins = [];

function create(pin) {
  pin.created_at = pin.created_at || +new Date;
  pins.push(pin);

  return Promise.resolve(true);
}
