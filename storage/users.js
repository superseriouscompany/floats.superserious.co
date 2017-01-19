'use strict';

const uuid  = require('uuid');
const error = require('../services/error');
const _     = require('lodash');

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
    users[user.id]  = user;
    resolve(user);
  })
}

function get(id) {
  return new Promise(function(resolve, reject) {
    if( !id )        { return reject(error('id is null', {name: 'InputError'})); }
    if( !users[id] ) { return reject(error('user not found', {name: 'UserNotFound', id: id}))}
    resolve(users[id]);
  })
}

function all() {
  return _.values(users);
}

function update(id, user) {
  if( !users[id] ) { throw error('No user found', {name: 'UserNotFound', id: id}); };
  users[id] = Object.assign(users[id], user);
  return Promise.resolve(true);
}

function destroy(id) {
  delete users[id];

  return Promise.resolve(true);
}

function flush() {
  if( process.env.NODE_ENV == 'production' ) { return; }
  users = {};
  return Promise.resolve(true);
}

function findByFacebookId(facebookId) {
  const key = _.findKey(users, {facebook_id: facebookId});
  if( !key ) { return Promise.resolve(null); }
  return Promise.resolve(users[key]);
}

function createFromFacebook(user) {
  user.facebook_id = user.id;
  user.id = uuid.v1();
  user.access_token = uuid.v1();
  user.avatar_url = `https://graph.facebook.com/v2.8/${user.facebook_id}/picture`
  users[user.id] = user;
  return Promise.resolve(user);
}
