'use strict';

const error = require('../services/error');

module.exports = {
  create: create,
}

let pins = [];

function create(pin) {
  pins.push(pin);

  return Promise.resolve(true);
}
