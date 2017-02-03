'use strict';

const _ = require('lodash');

module.exports = {
  create: create,
  all: all,
  destroy: destroy,
}

let friend_requests = {}

function create(requester, userId) {
  return Promise.resolve().then(() => {
    friend_requests[userId] = friend_requests[userId] || [];
    friend_requests[userId].unshift({created_at: +new Date, user: requester});
    return true;
  })
}

function all(userId) {
  return Promise.resolve().then(() => {
    return friend_requests[userId] || [];
  })
}

function destroy(userId, randoId) {
  return Promise.resolve().then(() => {
    friend_requests[userId] = _.reject(friend_requests[userId], (fr) => {
      return fr.user.id == randoId
    })
    return true;
  })
}
