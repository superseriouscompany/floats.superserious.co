'use strict';

const _ = require('lodash');
const db = {
  friend_requests: require('../db/friend_requests')
}

module.exports = {
  create: create,
  all: all,
  deny: deny,
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
