'use strict';

module.exports = {
  create: create,
  all: all,
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
