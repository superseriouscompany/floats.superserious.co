'use strict';

const uuid  = require('uuid');
const _     = require('lodash');
const users = require('./users');

module.exports = {
  create: create,
  get: get,
  findByInvitee: findByInvitee,
  findByCreator: findByCreator,
  join: join,
  attendees: attendees,
  destroy: destroy,
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

function get(id) {
  return Promise.resolve(floats[id]);
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

function join(floatId, userId) {
  return users.get(userId).then(function(user) {
    floats[floatId].attendees.push(_.pick(user, 'id', 'avatar_url', 'name', 'username'))
    return Promise.resolve(true);
  })
}

function attendees(float) {
  return Promise.resolve(float.attendees);
}

function destroy(floatId) {
  delete floats[floatId];
  return Promise.resolve(true);
}

function flush() {
  if( process.env.NODE_ENV == 'production' ) { return; }
  floats = {};
  return Promise.resolve(true);
}
