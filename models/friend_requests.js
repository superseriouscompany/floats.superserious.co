'use strict';

const _ = require('lodash');
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

function create(requester, userId) {
  return db.friend_requests.create(_.pick(requester, 'name', 'avatar_url', 'id'), userId);
}

function all(userId) {
  return db.friend_requests.all(userId);
}

function deny(userId, randoId) {
  return db.friend_requests.destroy(userId, randoId);
}

function accept(userId, randoId) {
  return db.users.get(randoId).then((u) => {
    return models.friends.create(userId, u)
  })
}
