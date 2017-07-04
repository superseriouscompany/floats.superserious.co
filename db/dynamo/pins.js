'use strict';

const client = require('./client');
const error  = require('../../services/error');
const config = require('../../config');

module.exports = {
  create: create,
}

function create(pin) {
  return Promise.resolve().then(() => {
    return client.put({
      TableName: config.pinsTableName,
      Item: pin
    })
  }).then(() => {
    return true
  })
}
