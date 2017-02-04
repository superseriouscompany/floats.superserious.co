'use strict';

const users = require('../users');
const error = require('../../services/error');

module.exports = {
  all: all,
  create: create,
  block: block,
  unblock: unblock,
  get: get,
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

function get(userId, friendId) {
  return Promise.resolve().then(function() {
    if( !friends[userId] ) {
      throw error('Friend not found', {name: 'FriendNotFound'});
    }
    return friends[userId]
  })
}
