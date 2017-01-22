'use strict';

const uuid  = require('uuid');
const _     = require('lodash');
const users = require('./users');

module.exports = {
  get:            get,
  create:         create,
  findByMemberId: findByMemberId,
  destroy:        destroy,
  leave:          leave,

  flush:          flush,
}

let convos = {};

function get(floatId, id) {
  return Promise.resolve().then(function() {
    return convos[id];
  })
}

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

function findByMemberId(userId) {
  return Promise.resolve().then(function() {
    return _.reject(_.values(convos), function(c) {
      !_.includes(c.members, userId);
    });
  })
}

function flush() {
  if( process.env.NODE_ENV == 'production' ) return Promise.reject('Production Safeguard :)');

  return Promise.resolve().then(function() {
    convos = {};
    return true;
  })
}

function destroy(floatId, id) {
  return Promise.resolve().then(function() {
    delete convos[id];
    return true;
  })
}

function leave(floatId, id, userId) {
  return Promise.resolve().then(function() {
    convos[id].members = _.reject(convos[id].members, function(m) {
      return m.id === userId
    })
    return true;
  })
}
