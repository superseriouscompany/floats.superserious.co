'use strict';

const config = require('../../config');
const uuid   = require('uuid');
const _      = require('lodash');
const users  = require('../users');
const error  = require('../../services/error');
const client = require('./client');

module.exports = {
  create:        create,
  get:           get,
  findByInvitee: findByInvitee,
  findByCreator: findByCreator,
  all:           all,
  leave:         leave,
  attendees:     attendees,
  addAttendee:   addAttendee,
  destroy:       destroy,
  flush:         flush,
}

let floats = {};

function create(float) {
  console.log('called dynamo create');
  return Promise.resolve().then(() => {
    if( !float ) { throw error('float not provided', {name: 'InputError'}); }
    if( !float.invitees ) { throw error('invitees not provided', {name: 'ValidationError'}); }
    if( !float.invitees.length ) { throw error('invitees are empty', {name: 'ValidationError'}); }
    if( !float.title ) { throw error('title not provided', {name: 'ValidationError'}); }
    if( !float.user ) { throw error('user not provided', {name: 'ValidationError'}); }
    if( !float.user.id ) { throw error('user id not provided', {name: 'ValidationError'}); }
    float.title = float.title && float.title.trim();
    if( float.title.length < 3 ) { throw error('title is too short', {name: 'SizeError'}); }
    if( float.title.length > 140 ) { throw error('title is too long', {name: 'SizeError'}); }

    float.id         = float.id || uuid.v1();
    float.created_at = float.created_at || +new Date;
    float.token      = float.token || uuid.v1();
    float.attendees  = float.attendees || [];

    return client.put({
      TableName: config.floatsTableName,
      Item: float,
    })
  }).then(() => {
    return float;
  });
}

function get(id) {
  return Promise.resolve().then(() => {
    if( !id ) { throw error('id not provided', {name: 'InputError'}); }
    if( !floats[id] ) { throw error('Float not found', {name: 'FloatNotFound', id: id }); }

    return client.get({
      TableName: config.floatsTableName,
      Key: { id: id },
    }).then(function(float) {
      if( !float.Item ) { throw error('float not found', {name: 'FloatNotFound', id: id})}
      return float.Item;
    })
  })
}

function all() {
  return client.scan({
    TableName: config.floatsTableName,
  }).then(function(floats) {
    return floats.Items;
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

function addAttendee(floatId, user) {
  return Promise.resolve().then(() => {
    if( !floatId ) { throw error('floatId not provided', {name: 'InputError'}); }
    if( !user )  { throw error('user not provided', {name: 'InputError'}); }
    if( !floats[floatId] ) { throw error('Float not found', {name: 'FloatNotFound', id: floatId }); }

    const conflict = floats[floatId].attendees.find(function(a) {
      return a.id === user.id
    })
    if( conflict ) { throw error('Float has already been joined.', {name: 'DuplicateJoinError'}); }

    floats[floatId].attendees.push(_.pick(user, 'id', 'avatar_url', 'name', 'username'))
    floats[floatId].invitees.push(user.id)
    return floats[floatId];
  })
}

function leave(floatId, userId) {
  return Promise.resolve().then(function() {
    floats[floatId].attendees = _.reject(floats[floatId].attendees, function(a) {
      return a.id == userId;
    })
    floats[floatId].invitees = _.reject(floats[floatId].invitees, function(id) {
      return id == userId;
    })

    return true;
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
