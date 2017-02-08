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
    return client.query({
      TableName: config.messagesTableName,
      KeyConditionExpression: 'convo_id = :convo_id',
      ExpressionAttributeValues: { ':convo_id': convoId },
      ScanIndexForward: false,
    })
  }).then((result) => {
    return result.Items
  })
}

function destroy(floatId, convoId, id) {
  return Promise.resolve().then(function() {
    return client.delete({
      TableName: config.messagesTableName,
      Key: { convo_id: convoId, id: Number(id) },
    })
  }).then((ok) => {
    return true
  })
}
