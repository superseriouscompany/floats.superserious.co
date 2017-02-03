'use strict';

const users = require('../users');

module.exports = {
  all: all,
  create: create,
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
