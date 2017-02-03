'use strict';

const _ = require('lodash');
const db = {
  friend_requests: require('../db/friend_requests')
}

module.exports = {
  create: create,
  all: all,
}

function create(requester, userId) {
  return db.friend_requests.create(_.pick(requester, 'name', 'avatar_url', 'id'), userId);
}

function all(userId) {
  return db.friend_requests.all(userId);
}
