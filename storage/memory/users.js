'use strict';

const uuid  = require('uuid');
const _     = require('lodash');
const error = require('../../services/error');

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
  return Promise.resolve(_.values(users));
}

function update(id, user) {
  return new Promise(function(resolve, reject) {
    if( !id || !user ) { return reject(error('id or user is null', {name: 'InputError', id: id, user: user})); };
    if( !users[id] ) { return reject(error('No user found', {name: 'UserNotFound', id: id})); };
    users[id] = Object.assign(users[id], user, {id: users[id].id, created_at: users[id].created_at});
    resolve(true);
  })
}

function destroy(id) {
  return new Promise(function(resolve, reject) {
    if( !id ) { return reject(error('id is null', {name: 'InputError'})); };
    if( !users[id] ) { return reject(error('No user found', {name: 'UserNotFound', id: id})); };

    delete users[id];
    resolve(true);
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
    user.id           = uuid.v1();
    user.access_token = uuid.v1();
    user.avatar_url   = `https: //graph.facebook.com/v2.8/${user.facebook_id}/picture`
    users[user.id]    = user;
    resolve(user);
  })
}
