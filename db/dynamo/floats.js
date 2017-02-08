'use strict';

const config = require('../../config');
const uuid   = require('uuid');
const _      = require('lodash');
const error  = require('../../services/error');
const client = require('./client');
const db = {
  members: require('./members'),
}

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
    const members = float.attendees.map((a) => {
      return {
        float_id: float.id,
        user_id:  a.id,
      }
    })
    return db.members.batchCreate(members)
  }).then(() => {
    return float;
  });
}

function get(id) {
  return Promise.resolve().then(() => {
    if( !id ) { throw error('id not provided', {name: 'InputError'}); }

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
  return db.members.findByUserId(userId).then((members) => {
    if( !members.length ) { return [] }

    let params = { RequestItems: {} };
    params.RequestItems[config.floatsTableName] = {
      Keys: members.map(function(m) {
        return {id: m.float_id}
      }),
    }

    return client.batchGet(params).then((result) => {
      if( !result.Responses ) { throw error('Unexpected dynamo response', {response: result})}
      return result.Responses[config.floatsTableName];
    })
  })
}

function findByCreator(userId) {
  return client.query({
    TableName: config.floatsTableName,
    IndexName: 'user_id',
    KeyConditionExpression: 'user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': userId
    }
  }).then((results) => {
    return results.Items;
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
  return get(floatId).then(function(float) {
    const attendees = _.reject(float.attendees, function(a) {
      return a.id == userId;
    })
    const invitees = _.reject(float.invitees, function(id) {
      return id == userId;
    })

    return Promise.all([
      client.update({
        TableName:                 config.floatsTableName,
        Key:                       { id: floatId },
        ConditionExpression:       'attribute_exists(id)',
        UpdateExpression:          'set attendees = :attendees, invitees = :invitees',
        ExpressionAttributeValues: { ':attendees': attendees, ':invitees': invitees},
      }),
      db.members.destroy(userId, floatId)
    ])
  }).then(function(ok) {
    return true;
  }).catch(function(err) {
    if( err.name == 'ConditionalCheckFailedException' ) {
      throw error('No float found', {name: 'FloatNotFound', id: id});
    }
    throw err;
  });
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
