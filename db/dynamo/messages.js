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

function create(floatId, convoId, userId, text) {
  return Promise.resolve().then(function() {
    return db.users.get(userId)
  }).then(function(user) {
    return client.update({
      TableName: config.convosTableName,
      Key: { float_id: floatId, id: convoId },
      UpdateExpression: 'set #counter = #counter + :inc',
      ExpressionAttributeValues: { ':inc': 1 },
      ExpressionAttributeNames:  { '#counter': 'counter' },
      ReturnValues: 'ALL_NEW',
    }).then(function(response) {
      return response.Attributes.counter;
    }).then((id) => {
      const message = {
        id:         id,
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
