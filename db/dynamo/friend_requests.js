'use strict';

const client = require('./client');
const config = require('../../config');
const error  = require('../../services/error');

module.exports = {
  create: create,
  all: all,
  destroy: destroy,
  get: get,
  from: from,
}

function create(rando, userId) {
  return Promise.resolve().then(() => {
    const friendRequest = {
      rando_id:   rando.id,
      user_id:    userId,
      user:       rando,
      created_at: +new Date,
    }

    return client.put({
      TableName: config.friendRequestsTableName,
      Item: friendRequest
    })
  }).then(() => {
    return true;
  })
}

function all(userId) {
  return Promise.resolve().then(() => {
    return client.query({
      TableName: config.friendRequestsTableName,
      IndexName: 'created_at',
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: { ':user_id': userId },
      ScanIndexForward: false,
    })
  }).then((result) => {
    return result.Items;
  })
}

function from(userId) {
  return Promise.resolve().then(() => {
    return client.query({
      TableName: config.friendRequestsTableName,
      IndexName: 'rando_id',
      KeyConditionExpression: 'rando_id = :rando_id',
      ExpressionAttributeValues: { ':rando_id': userId },
      ScanIndexForward: false,
    })
  }).then((result) => {
    return result.Items;
  })
}

function destroy(userId, randoId) {
  return Promise.resolve().then(() => {
    return client.delete({
      TableName: config.friendRequestsTableName,
      Key: { user_id: userId, rando_id: randoId }
    })
  }).then((ok) => {
    return true;
  })
}

function get(userId, randoId) {
  return Promise.resolve().then(() => {
    return client.get({
      TableName: config.friendRequestsTableName,
      Key: { user_id: userId, rando_id: randoId }
    })
  }).then((result) => {
    if( !result || !result.Item ) {
      throw error('Friend request not found', {name: 'FriendRequestNotFound'})
    }

    return result.Item
  })
}
