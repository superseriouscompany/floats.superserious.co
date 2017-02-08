'use strict';

const _      = require('lodash');
const client = require('./client');
const config = require('../../config');
const error  = require('../../services/error');
const db = {
  users: require('./users'),
}

module.exports = {
  create: create,
  findByConvo: findByConvo,
  destroy: destroy,
}

let messages = {};
let inc = 1;

function create(floatId, convoId, userId, text) {
  return Promise.resolve().then(function() {
    return db.users.get(userId)
  }).then(function(user) {
    const message = {
      id:         inc++,
      user:       _.pick(user, 'id', 'avatar_url', 'name'),
      text:       text,
      created_at: +new Date,
      float_id:   floatId,
      convo_id:   convoId,
    };

    return client.put({
      TableName: config.messagesTableName,
      Item:      message
    }).then(() => {
      return message;
    })
  });
}

function findByConvo(floatId, convoId) {
  return Promise.resolve().then(function() {
    return messages[floatId] && messages[floatId][convoId] || [];
  })
}

function destroy(floatId, convoId, id) {
  return Promise.resolve().then(function() {
    messages[floatId][convoId] = _.reject(messages[floatId][convoId], function(m) {
      return m.id == id;
    })
    return true;
  })
}
