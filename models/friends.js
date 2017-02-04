'use strict';

const error  = require('../services/error');
const notify = require('../services/notify')
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
  let user;
  return get(userId, rando.id).then(() => {
    throw error('You\'re already friends.', {name: 'Conflict'})
  }).catch((err) => {
    if( err.name != 'FriendNotFound' ) { throw err;}
    return true;
  }).then(() => {
    return db.users.get(userId)
  }).then((u) => {
    user = u;
    return Promise.all([
      db.friends.create(user, rando),
      db.friends.create(rando, user),
    ])
  }).then(() => {
    return notify.firebase(rando.firebase_token, `${user.name} is your friend now`, {
      type: 'friends:new',
      friend: user,
    });
  }).then(() => {
    return true;
  })
}

function block(userId, friendId) {
  return db.friends.block(userId, friendId)
}

function unblock(userId, friendId) {
  return db.friends.unblock(userId, friendId)
}
