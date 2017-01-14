'use strict';

const uuid = require('uuid');
const _    = require('lodash');

module.exports = {
  create: create,
  findByInvitee: findByInvitee,
  findByCreator: findByCreator,

  flush: flush,
}

let floats = {};

function create(float) {
  // TODO validate user_id, invitees, title, created_at
  float.id         = float.id || uuid.v1();
  float.created_at = float.created_at || +new Date;
  float.attendees  = float.attendees || [];
  floats[float.id] = float;
  return Promise.resolve(float);
}

function findByInvitee(userId) {
  const fs = _.values(floats).filter(function(f) {
    return _.includes(f.invitees, userId);
  })

  return Promise.resolve(fs);
}

function findByCreator(userId) {
  const fs = _.values(floats).filter(function(f) {
    return f.user.id == userId
  })

  return Promise.resolve(fs);
}

function flush() {
  if( process.env.NODE_ENV == 'production' ) { return; }
  floats = {};
  return Promise.resolve(true);
}
