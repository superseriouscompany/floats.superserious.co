'use strict';

const uuid = require('uuid');

module.exports = {
  create: create,
}

let floats = {};

function create(float) {
  // TODO validate user_id, invitees, title, created_at
  float.id = float.id || uuid.v1();
  float.created_at = float.created_at || +new Date;
  floats[float.id] = float;
  return Promise.resolve(float);
}
