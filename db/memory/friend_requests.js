'use strict';

const _     = require('lodash');
const error = require('../../services/error');

module.exports = {
  create: create,
  all: all,
  destroy: destroy,
  find: find,
  from: from,
}

let friend_requests = {}

function create(rando, userId) {
  return Promise.resolve().then(() => {
    friend_requests[userId] = friend_requests[userId] || [];
    friend_requests[userId].unshift({created_at: +new Date, user: rando});
    return true;
  })
}

function all(userId) {
  return Promise.resolve().then(() => {
    return friend_requests[userId] || [];
  })
}

function from(userId) {
  return Promise.resolve().then(() => {
    const matches = [];
    for( var key in friend_requests ) {
      friend_requests[key].forEach((fr) => {
        if( fr.user.id == userId ) {
          matches.push({user: {id: key}})
        }
      })
    }
    return matches;
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

function find(userId, randoId) {
  return Promise.resolve().then(() => {
    const match = (friend_requests[userId] || []).find((u) => {
      return u.user.id == randoId
    })
    if( !match ) { throw error('Friend request not found', {name: 'FriendRequestNotFound'})}
    return match;
  })
}
