'use strict';

const db = {
  friends: require('../db/friends'),
  users: require('../db/users'),
}

module.exports = {
  all: all,
  create: create,
}

function all(userId) {
  return db.friends.all(userId);
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
