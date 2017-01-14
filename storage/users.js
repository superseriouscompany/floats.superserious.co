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
  flush: flush,
}

let users = {};

function all() {
  return _.values(users);
}

function create(user) {
  user.id = user.id || uuid.v1();
  users[user.id] = user;
  return Promise.resolve(user);
}

function update(id, user) {
  if( !users[id] ) { throw error('No user found', {name: 'UserNotFound', id: id}); };
  users[id] = Object.assign(users[id], user);
  return Promise.resolve(true);
}

function get(id) {
  return Promise.resolve(users[id]);
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
  users[user.id] = user;
  return Promise.resolve(user);
}
