'use strict';

const _      = require('lodash');
const error  = require('../services/error');
const models = {
  friends: require('../models/friends'),
}
const db = {
  friend_requests: require('../db/friend_requests'),
  users: require('../db/users'),
}

module.exports = {
  create: create,
  all: all,
  deny: deny,
  accept: accept,
  undo: undo,
}

function create(rando, userId) {
  return Promise.resolve().then(() => {
    return db.friend_requests.get(userId, rando.id)
  }).then(() => {
    throw error('You have already sent this friend request.', {name: 'Conflict'})
  }).catch((err) => {
    if( err.name != 'FriendRequestNotFound' ) { throw err;}
    return true;
  }).then(() => {
    return models.friends.get(userId, rando.id).then((friend) => {
      throw error('You are already friends.', {name: 'Conflict'})
    }).catch((err) => {
      if( err.name != 'FriendNotFound' ) { throw err; }
      return true;
    })
  }).then(() => {
    return db.friend_requests.get(rando.id, userId).catch((err) => {
      if( err.name != 'FriendRequestNotFound' ) { throw err; }
      return false;
    })
  }).then((existingRequest) => {
    if( !existingRequest ) {
      return db.friend_requests.create(_.pick(rando, 'name', 'avatar_url', 'id'), userId);
    }

    return models.friends.create(userId, rando).then(() => {
      return {friendship: {id: userId}}
    })
  })
}

function all(userId) {
  return db.friend_requests.all(userId);
}

function deny(userId, randoId) {
  return db.friend_requests.destroy(userId, randoId);
}

function undo(randoId, userId) {
  return db.friend_requests.destroy(userId, randoId);
}

function accept(userId, randoId) {
  return db.users.get(randoId).then((u) => {
    return models.friends.create(userId, u);
  }).then(() => {
    return db.friend_requests.destroy(userId, randoId);
  })
}
