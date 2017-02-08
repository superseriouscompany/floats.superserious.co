'use strict';

const uuid   = require('uuid');
const _      = require('lodash');
const client = require('./client');
const error  = require('../../services/error');
const config = require('../../config');
const db = {
  members: require('./members')
}

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
    if( !floatId || !id ) { throw error('Empty floatId or id', {floatId: floatId, id: id, name: 'InputError'}); }

    return client.get({
      TableName: config.convosTableName,
      Key: { float_id: floatId, id: id }
    })
  }).then((response) => {
    return response.Items
  })
}

function create(floatId, userId, members, users) {
  const id = uuid.v1();
  const convo = {
    id: id,
    float_id: floatId,
    members: [userId].concat(members),
    users: users,
    created_at: +new Date,
  }

  return Promise.resolve().then(function() {
    if( !floatId || !userId || !members || !users ) {
      throw error('Invalid input', {name: 'InputError', floatId: floatId, userId: userId, members: members, users: users})
    }

    const memberJoins = users.map((u) => {
      return {
        convo_id: id,
        float_id: floatId,
        user_id:  u.id
      }
    })

    return db.members.batchCreate(memberJoins)
  }).then(() => {
    users = users.map(function(u) {
      return _.pick(u, 'id', 'avatar_url', 'name');
    })

    return client.put({
      TableName: config.convosTableName,
      Item: convo,
    })
  }).then(() => {
    return convo
  })
}

function findByMemberId(userId) {
  return db.members.findByUserId(userId).then((members) => {
    if( !members.length ) { return [] }

    let params = { RequestItems: {} };
    params.RequestItems[config.convosTableName] = {
      Keys: members.map(function(m) {
        return {float_id: m.float_id, id: m.convo_id}
      }),
    }

    return client.batchGet(params).then((result) => {
      if( !result.Responses ) { throw error(`Unexpected dynamo response ${JSON.stringify(result)}`, {cool: result})}
      return result.Responses[config.convosTableName];
    })
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
