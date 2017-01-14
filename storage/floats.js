'use strict';

const uuid = require('uuid');
const _    = require('lodash');

module.exports = {
  create: create,
  findByInvitee: findByInvitee,
}

let floats = {};

function create(float) {
  // TODO validate user_id, invitees, title, created_at
  console.log("creating float", JSON.stringify(float));
  float.id = float.id || uuid.v1();
  float.created_at = float.created_at || +new Date;
  floats[float.id] = float;
  return Promise.resolve(float);
}

function findByInvitee(userId) {
  const fs = _.values(floats).filter(function(f) {
    return _.includes(f.invitees, userId);
  })

  return Promise.resolve(fs);
}
