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

function create(userId, rando) {
  return Promise.resolve().then(function() {
    friends[userId] = friends[userId] || []
    friends[userId].unshift(rando);
    return true;
  })
}
