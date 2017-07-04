'use strict';

const error  = require('../../services/error');
const config = require('../../config');
const client = require('./client');

module.exports = {
  all:     all,
  create:  create,
  update:  update,
  get:     get,
  destroy: destroy,
}

let friends = [];

function all(userId) {
  if( !userId ) { return Promise.reject(error('userId is null', {name: 'InputError'})); }
  return client.query({
    TableName:                 config.friendsTableName,
    KeyConditionExpression:    'user_id = :userId',
    ExpressionAttributeValues: {':userId': userId}
  }).then(function(result) {
    return result.Items;
  })
}

function create(user, rando) {
  if( !user )  { return Promise.reject(error('user is null', {name: 'InputError'})); }
  if( !rando ) { return Promise.reject(error('rando is null', {name: 'InputError'})); }

  const friend = {
    user_id:    user.id,
    friend_id:  rando.id,
    name:       rando.name,
    avatar_url: rando.avatar_url,
    created_at: +new Date,
  }
  return client.put({
    TableName: config.friendsTableName,
    Item:      friend,
  }).then(function() {
    return friend;
  })
}

function destroy(userId, friendId) {
  return client.delete({
    TableName: config.friendsTableName,
    Key: {
      user_id:   userId,
      friend_id: friendId,
    },
  })
}

function update(userId, friendId, values) {
  if( !userId || !friendId ) { return Promise.reject(error('userId or friendId is null', {name: 'InputError', userId: userId, friendId: friendId})); };

  let updateExpression = 'set';
  let attributeNames   = {};
  let attributeValues  = {};
  ['blocked', 'blockee'].forEach(function(field) {
    if( values[field] !== undefined ) {
      attributeNames[`#${field}`]  = field;
      attributeValues[`:${field}`] = values[field];
      updateExpression += `#${field} = :${field},`
    }
  })
  if( !Object.keys(attributeValues).length )  { return Promise.reject(error('none provided of: blocked, blockee', {name: 'InputError', userId: userId, friendId: friendId, values: values}))}
  updateExpression = updateExpression.substring(0,updateExpression.length - 1);

  return client.update({
    TableName:                 config.friendsTableName,
    Key:                       { user_id: userId, friend_id: friendId },
    ConditionExpression:       'attribute_exists(user_id) and attribute_exists(friend_id)',
    UpdateExpression:          updateExpression,
    ExpressionAttributeValues: attributeValues,
    ExpressionAttributeNames:  attributeNames,
  }).then(function(ok) {
    return true;
  }).catch(function(err) {
    if( err.name == 'ConditionalCheckFailedException' ) {
      throw error('No friend found', {name: 'FriendNotFound', userId: userId, friendId: friendId});
    }
    throw err;
  });
}

function block(userId, friendId) {
  if( !userId || !friendId ) { return Promise.reject(error('userId or friendId is null', {name: 'InputError', userId: userId, friendId: friendId})); };

  return client.update({
    TableName:                 config.friendsTableName,
    Key:                       { user_id: userId, friend_id: friendId },
    ConditionExpression:       'attribute_exists(user_id) and attribute_exists(friend_id)',
    UpdateExpression:          'set #blocked = :blocked',
    ExpressionAttributeValues: {':blocked': true},
    ExpressionAttributeNames:  {'#blocked': 'blocked'},
  }).then(function(ok) {
    return true;
  }).catch(function(err) {
    if( err.name == 'ConditionalCheckFailedException' ) {
      throw error('No friend found', {name: 'FriendNotFound', userId: userId, friendId: friendId});
    }
    throw err;
  });
}

function unblock(userId, friendId) {
  if( !userId || !friendId ) { return Promise.reject(error('userId or friendId is null', {name: 'InputError', userId: userId, friendId: friendId})); };

  return client.update({
    TableName:                 config.friendsTableName,
    Key:                       { user_id: userId, friend_id: friendId },
    ConditionExpression:       'attribute_exists(user_id) and attribute_exists(friend_id)',
    UpdateExpression:          'set #blocked = :blocked',
    ExpressionAttributeValues: {':blocked': false},
    ExpressionAttributeNames:  {'#blocked': 'blocked'},
  }).then(function(ok) {
    return true;
  }).catch(function(err) {
    if( err.name == 'ConditionalCheckFailedException' ) {
      throw error('No friend found', {name: 'FriendNotFound', userId: userId, friendId: friendId});
    }
    throw err;
  });
}

function get(userId, friendId) {
  if( !userId ) { return Promise.reject(error('userId is null', {name: 'InputError'})); }
  if( !friendId ) { return Promise.reject(error('userId is null', {name: 'InputError'})); }

  return client.get({
    TableName: config.friendsTableName,
    Key: {
      user_id:   userId,
      friend_id: friendId,
    },
  }).then(function(friendship) {
    if( !friendship.Item ) { throw error('friend not found', {name: 'FriendNotFound', user_id: userId, friend_id: friendId})}
    return friendship.Item;
  })
}
