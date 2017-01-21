'use strict';

const uuid  = require('uuid');
const _     = require('lodash');
const users = require('./users');

module.exports = {
  create:         create,
  findByMemberId: findByMemberId,
  destroy:        destroy,

  flush:          flush,
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
