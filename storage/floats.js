'use strict';

const uuid  = require('uuid');
const _     = require('lodash');
const users = require('./users');
const error = require('../services/error');

module.exports = {
  create: create,
  get: get,
  findByInvitee: findByInvitee,
  findByCreator: findByCreator,
  join: join,
  attendees: attendees,
  destroy: destroy,
  flush: flush,
}

let floats = {};

function create(float) {
  return new Promise(function(resolve, reject) {
    if( !float ) { return reject(error('float not provided', {name: 'InputError'})); }
    if( !float.invitees ) { return reject(error('invitees not provided', {name: 'ValidationError'})); }
    if( !float.invitees.length ) { return reject(error('invitees are empty', {name: 'ValidationError'})); }
    if( !float.title ) { return reject(error('title not provided', {name: 'ValidationError'})); }
    if( !float.user ) { return reject(error('user not provided', {name: 'ValidationError'})); }
    if( !float.user.id ) { return reject(error('user id not provided', {name: 'ValidationError'})); }
    float.title = float.title && float.title.trim();
    if( float.title.length < 3 ) { return reject(error('title is too short', {name: 'SizeError'})); }
    if( float.title.length > 140 ) { return reject(error('title is too long', {name: 'SizeError'})); }

    return users.get(float.user.id).then(function() {
      float.id         = float.id || uuid.v1();
      float.created_at = float.created_at || +new Date;
      float.attendees  = float.attendees || [];
      floats[float.id] = float;
      resolve(float);
    }).catch(reject);
  })
}

function get(id) {
  return new Promise(function(resolve, reject) {
    if( !id ) { return reject(error('id not provided', {name: 'InputError'})); }
    if( !floats[id] ) { return reject(error('Float not found', {name: 'FloatNotFound', id: id })); }

    resolve(floats[id]);
  })
}

function findByInvitee(userId) {
  return new Promise(function(resolve, reject) {
    if( !userId ) { return reject(error('userId not provided', {name: 'InputError'})); }
    const all = _.values(floats).filter(function(f) {
      return _.includes(f.invitees, userId);
    })
    resolve(all);
  })
}

function findByCreator(userId) {
  return new Promise(function(resolve, reject) {
    if( !userId ) { return reject(error('userId not provided', {name: 'InputError'})); }
    const fs = _.values(floats).filter(function(f) {
      return f.user.id == userId
    })

    resolve(fs);
  })
}

function join(floatId, userId) {
  return new Promise(function(resolve, reject) {
    if( !floatId ) { return reject(error('floatId not provided', {name: 'InputError'})); }
    if( !userId )  { return reject(error('userId not provided', {name: 'InputError'})); }
    if( !floats[floatId] ) { return reject(error('Float not found', {name: 'FloatNotFound', id: floatId })); }

    users.get(userId).then(function(user) {
      const conflict = floats[floatId].attendees.find(function(a) {
        return a.id === userId
      })
      if( conflict ) { throw error('Float has already been joined.', {name: 'DuplicateJoinError'}); }

      floats[floatId].attendees.push(_.pick(user, 'id', 'avatar_url', 'name', 'username'))

      return resolve(true);
    }).catch(reject);
  })

}

function attendees(float) {
  return new Promise(function(resolve, reject) {
    if( !float || !float.id ) { return reject(error('float not provided', {name: 'InputError', float: float})); }
    resolve(float.attendees);
  })
}

function destroy(floatId) {
  return new Promise(function(resolve, reject) {
    if( !floatId ) { return reject(error('floatId not provided', {name: 'InputError'})); }
    if( !floats[floatId] ) { return reject(error('Float not found', {name: 'FloatNotFound', id: floatId })); }
    delete floats[floatId];
    resolve(true);
  })
}

function flush() {
  if( process.env.NODE_ENV == 'production' ) { return Promise.reject('Not in prod'); }
  floats = {};
  return Promise.resolve(true);
}
