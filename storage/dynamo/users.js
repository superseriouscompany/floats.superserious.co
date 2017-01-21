'use strict';

const uuid   = require('uuid');
const _      = require('lodash');
const client = require('./client');
const error  = require('../../services/error');
const config = require('../../config');

module.exports = {
  create: create,
  update: update,
  get: get,
  findByFacebookId: findByFacebookId,
  createFromFacebook: createFromFacebook,
  all: all,
  destroy: destroy,
  flush: flush,
}

let users = {};

function create(user) {
  return new Promise(function(resolve, reject) {
    if( !user ) { return reject(error('user is null', {name: 'InputError'})); }
    user.id         = user.id || uuid.v1();
    user.created_at = user.created_at || +new Date;
    return client.put({
      TableName: config.usersTableName,
      Item: user,
    }).then(function() {
      resolve(user);
    }).catch(reject);
  })
}

function get(id) {
  return new Promise(function(resolve, reject) {
    if( !id )        { return reject(error('id is null', {name: 'InputError'})); }
    return client.get({
      TableName: config.usersTableName,
      Key: { id: id },
    }).then(function(user) {
      if( !user.Item ) { return reject(error('user not found', {name: 'UserNotFound', id: id}))}
      resolve(user.Item);
    }).catch(reject);
  })
}

function all() {
  return Promise.resolve(_.values(users));
}

function update(id, user) {
  return new Promise(function(resolve, reject) {
    if( !id || !user ) { return reject(error('id or user is null', {name: 'InputError', id: id, user: user})); };
    if( !users[id] ) { return reject(error('No user found', {name: 'UserNotFound', id: id})); };

    const fields = _.pick(req.body, 'name', 'username', 'firebase_token');

    return client.update({
      TableName: config.usersTableName,
      Key: { id: id },
      UpdateExpression: 'set name = :name, username = :username, firebase_token = :firebase_token',
      ExpressionAttributeValues: {
        ':name': user.name,
        ':username': user.username,
        ':firebase_token': user.firebase_token,
      },
    }).then(function(ok) {
      resolve(true)
    }).catch(reject);
  })
}

function destroy(id) {
  return new Promise(function(resolve, reject) {
    if( !id ) { return reject(error('id is null', {name: 'InputError'})); };
    if( !users[id] ) { return reject(error('No user found', {name: 'UserNotFound', id: id})); };

    return client.delete({
      TableName: config.usersTableName,
      Key: { id: id },
    }).then(function(ok) {
      resolve(ok);
    }).catch(reject)
  })
}

function flush() {
  if( process.env.NODE_ENV == 'production' ) { return Promise.reject('Not in prod'); }
  users = {};
  return Promise.resolve(true);
}

function findByFacebookId(facebookId) {
  return new Promise(function(resolve, reject) {
    if( !facebookId ) { return reject(error('facebookId is null', {name: 'InputError'})); }
    const key = _.findKey(users, {facebook_id: facebookId});
    if( !key ) { return reject(error('No user found', {name: 'UserNotFound'})); }

    return resolve(users[key]);
  })
}

function createFromFacebook(user) {
  return new Promise(function(resolve, reject) {
    if( !user ) { return reject(error('user is null', {name: 'InputError'})); }
    if( !user.id ) { return reject(error('user id is null', {name: 'InputError', user: user}))}

    user.facebook_id  = user.id;
    user.access_token = uuid.v1();
    user.avatar_url   = `https: //graph.facebook.com/v2.8/${user.facebook_id}/picture`
    return create(user).then(resolve).catch(reject);
  })
}
