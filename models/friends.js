'use strict';

const db = {
  friends: require('../db/friends')
}

module.exports = {
  all: all,
  create: create,
}

function all(userId) {
  return db.friends.all(userId);
}

function create(userId, rando) {
  return db.friends.create(userId, rando);
}
