'use strict';

const users = require('../users');

module.exports = {
  all: all,
  create: create,
  block: block,
  unblock: unblock,
}

let friends = {}

function all(userId) {
  return Promise.resolve().then(function() {
    return friends[userId] || []
  })
}

function create(user, rando) {
  return Promise.resolve().then(function() {
    friends[user.id] = friends[user.id] || []
    friends[user.id].unshift(rando);
    return true;
  })
}

function block(userId, friendId) {
  return Promise.resolve().then(function() {
    friends[userId] = friends[userId].map((f) => {
      if( f.id == friendId ) {
        f.blocked = true;
      }
      return f;
    })
  })
}

function unblock(userId, friendId) {
  return Promise.resolve().then(function() {
    friends[userId] = friends[userId].map((f) => {
      if( f.id == friendId ) {
        f.blocked = false;
      }
      return f;
    })
  })
}
