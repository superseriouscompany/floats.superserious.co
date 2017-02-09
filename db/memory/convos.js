'use strict';

const uuid  = require('uuid');
const _     = require('lodash');
const users = require('./users');

module.exports = {
  get:              get,
  create:           create,
  findByMemberId:   findByMemberId,
  findByFloatId:    findByFloatId,
  destroyByFloatId: destroyByFloatId,
  destroy:          destroy,
  join:             join,
  leave:            leave,
  leaveAll:         leaveAll,
  setLastMessage:   setLastMessage,

  flush:            flush,
}

let convos = {};

function get(floatId, id) {
  return Promise.resolve().then(function() {
    return convos[id];
  })
}

function create(floatId, userId, members, users) {
  return Promise.resolve().then(function() {
    if( users ) {
      users = users.map(function(u) {
        return _.pick(u, 'id', 'avatar_url', 'name');
      })
    }

    const convo = {
      id: uuid.v1(),
      float_id: floatId,
      members: [userId].concat(members),
      users: users,
      created_at: +new Date,
    }
    convos[convo.id] = convo;
    return convo;
  })
}

function findByMemberId(userId) {
  return Promise.resolve().then(function() {
    return _.reject(_.values(convos), function(c) {
      return !_.includes(c.members, userId);
    });
  })
}

function findByFloatId(floatId) {
  return Promise.resolve().then(() => {
    return _.values(convos).filter((c) => {
      return c.float_id == floatId
    })
  })
}

function destroyByFloatId(floatId) {
  return Promise.resolve().then(function() {
    convos = _.omitBy(convos, function(c) {
      return c.float_id == floatId;
    })

    return true;
  })
}

function setLastMessage(floatId, convoId, message) {
  return Promise.resolve().then(function() {
    convos[convoId].message = message;
    return true;
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

function leaveAll(floatId, userId) {
  return findByMemberId(userId).then(function(convos) {
    convos = convos.filter(function(c) {
      return c.float_id == floatId;
    })

    return Promise.all(convos.map(function(c) {
      return leave(c.float_id, c.id, userId);
    }))
  })
}

function join(floatId, id, user) {
  return Promise.resolve().then(() => {
    return get(floatId, id)
  }).then((convo) => {
    convo.members    = convo.members.concat(user.id);
    convo.users      = convo.users.concat(_.pick(user, 'id', 'avatar_url', 'name'));
    convos[convo.id] = convo;
    return true;
  })
}

function leave(floatId, id, userId) {
  return Promise.resolve().then(function() {
    convos[id].members = _.reject(convos[id].members, function(id) {
      return id === userId
    })
    if( convos[id].members.length == 1 ) {
      return destroy(floatId, id)
    } else {
      return true;
    }
  })
}
