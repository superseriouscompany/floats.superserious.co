'use strict';

const db = {
  friend_requests: require('../db/friend_requests')
}

module.exports = {
  create: create,
}

function create(requester, userId) {
  return db.friend_requests.create(requester, userId);
}
