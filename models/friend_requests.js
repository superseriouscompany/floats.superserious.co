'use strict';

const _ = require('lodash');
const error = require('../services/error');
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
}

function create(rando, userId) {
  return db.friend_requests.find(userId, rando.id).then(() => {
    throw error('There is already a friend request', {name: 'Conflict'})
  }).catch((err) => {
    if( err.name != 'FriendRequestNotFound' ) { throw err;}
    return true;
  }).then(() => {
    return db.friend_requests.create(_.pick(rando, 'name', 'avatar_url', 'id'), userId);
  })
}

function all(userId) {
  return db.friend_requests.all(userId);
}

function deny(userId, randoId) {
  // TODO: block
  return db.friend_requests.destroy(userId, randoId);
}

function accept(userId, randoId) {
  return db.users.get(randoId).then((u) => {
    return models.friends.create(userId, u)
  }).then(() => {
    return db.friend_requests.destroy(userId, randoId);
  })
}
