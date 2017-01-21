'use strict';

const uuid   = require('uuid');
const _      = require('lodash');
const client = require('./client');
const schema = require('./schemas/schemas').users;
const error  = require('../../services/error');
const config = require('../../config');

module.exports = {
  create: create,
  update: update,
  get: get,
  findByFacebookId: findByFacebookId,
  findByAccessToken: findByAccessToken,
  createFromFacebook: createFromFacebook,
  all: all,
  destroy: destroy,
  flush: flush,
}

let users = {};

function create(user) {
  if( !user ) { return Promise.reject(error('user is null', {name: 'InputError'})); }

  user.id         = user.id || uuid.v1();
  user.created_at = user.created_at || +new Date;
  return client.put({
    TableName: config.usersTableName,
    Item: user,
  }).then(function() {
    return user;
  });
}

function get(id) {
  if( !id ) { return Promise.reject(error('id is null', {name: 'InputError'})); }
  return client.get({
    TableName: config.usersTableName,
    Key: { id: id },
  }).then(function(user) {
    if( !user.Item ) { throw error('user not found', {name: 'UserNotFound', id: id})}
    return user.Item;
  })
}

function all() {
  return client.scan({
    TableName: config.usersTableName,
  }).then(function(users) {
    return users.Items;
  })
}

function update(id, user) {
  if( !id || !user ) { return Promise.reject(error('id or user is null', {name: 'InputError', id: id, user: user})); };

  let updateExpression = 'set';
  let attributeNames   = {};
  let attributeValues  = {};
  ['name', 'username', 'firebase_token', 'lat', 'lng', 'last_pin_at'].forEach(function(field) {
    if( user[field] ) {
      attributeNames[`#${field}`]  = field;
      attributeValues[`:${field}`] = user[field];
      updateExpression += `#${field} = :${field},`
    }
  })
  if( _.isEmpty(attributeValues) )  { return Promise.reject(error('none provided of: name, username, firebase_token', {name: 'InputError', id: id, user: user}))}
  updateExpression = updateExpression.substring(0,updateExpression.length - 1);

  return client.update({
    TableName:                 config.usersTableName,
    Key:                       { id: id },
    ConditionExpression:       'attribute_exists(id)',
    UpdateExpression:          updateExpression,
    ExpressionAttributeValues: attributeValues,
    ExpressionAttributeNames:  attributeNames,
  }).then(function(ok) {
    return true;
  }).catch(function(err) {
    if( err.name == 'ConditionalCheckFailedException' ) {
      throw error('No user found', {name: 'UserNotFound', id: id});
    }
    throw err;
  });
}

function destroy(id) {
  if( !id ) { return Promise.reject(error('id is null', {name: 'InputError'})); };
  return client.delete({
    TableName: config.usersTableName,
    ConditionExpression: 'attribute_exists(id)',
    Key: { id: id },
  }).then(function(ok) {
    return ok;
  }).catch(function(err) {
    if( err.name == 'ConditionalCheckFailedException' ) {
      throw error('No user found', {name: 'UserNotFound', id: id})
    }
    throw err;
  })
}

function flush() {
  if( process.env.NODE_ENV == 'production' ) { return Promise.reject('Not in prod'); }

  return client.truncate(config.usersTableName, schema);
}

function findByFacebookId(facebookId) {
  if( !facebookId ) { return Promise.reject(error('facebookId is null', {name: 'InputError'})); }
  return client.query({
    TableName: config.usersTableName,
    IndexName: 'facebook_id',
    KeyConditionExpression: 'facebook_id = :facebook_id',
    ExpressionAttributeValues: {
      ':facebook_id': facebookId
    },
    Limit: 1,
  }).then(function(user) {
    if( !user.Items.length ) { throw error('No user found', {name: 'UserNotFound'}); }
    return user.Items[0];
  })
}

function findByAccessToken(accessToken) {
  if( !accessToken ) { return Promise.reject(error('accessToken is null', {name: 'InputError'})); }
  return client.query({
    TableName: config.usersTableName,
    IndexName: 'access_token',
    KeyConditionExpression: 'access_token = :access_token',
    ExpressionAttributeValues: {
      ':access_token': accessToken
    },
    Limit: 1,
  }).then(function(user) {
    if( !user.Items.length ) { throw error('No user found', {name: 'UserNotFound'}); }
    return user.Items[0];
  })
}

function createFromFacebook(user) {
  return new Promise(function(resolve, reject) {
    if( !user ) { return reject(error('user is null', {name: 'InputError'})); }
    if( !user.id ) { return reject(error('user id is null', {name: 'InputError', user: user}))}

    user.facebook_id  = user.id;
    user.id           = null;
    user.access_token = uuid.v1();
    user.avatar_url   = `https: //graph.facebook.com/v2.8/${user.facebook_id}/picture`
    return create(user).then(resolve).catch(reject);
  })
}
