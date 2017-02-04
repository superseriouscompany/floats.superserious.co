'use strict';

const db = {
  friends: require('../db/friends'),
  users: require('../db/users'),
}

module.exports = {
  all: all,
  create: create,
  block: block,
  unblock: unblock,
  get: get,
}

function all(userId) {
  return db.friends.all(userId);
}

function get(userId, friendId) {
  return db.friends.get(userId, friendId);
}

function create(userId, rando) {
  return db.users.get(userId).then((user) => {
    return Promise.all([
      db.friends.create(user, rando),
      db.friends.create(rando, user),
    ]).then(() => {
      return true;
    })
  })
}

function block(userId, friendId) {
  return db.friends.block(userId, friendId)
}

function unblock(userId, friendId) {
  return db.friends.unblock(userId, friendId)
}
