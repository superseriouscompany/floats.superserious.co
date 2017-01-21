'use strict';

const uuid  = require('uuid');
const _     = require('lodash');
const users = require('./users');

module.exports = {
  create: create,
}

let convos = {};

function create(floatId, userId, members) {
  return Promise.resolve().then(function() {
    const convo = {
      id: uuid.v1(),
      float_id: floatId,
      members: [userId].concat(members),
    }
    convos[convo.id] = convo;
    return convo;
  })
}
