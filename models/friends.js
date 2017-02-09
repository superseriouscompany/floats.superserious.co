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
  destroy: destroy,
  block: block,
  unblock: unblock,
  get: get,
  allUsers: allUsers,
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
    return notify.firebase(rando.firebase_token, `${user.name} is your friend now.`, {
      type: 'friends:new',
      friend: user,
    });
  }).then(() => {
    return true;
  })
}

function destroy(userId, friendId) {
  return Promise.all([
    db.friends.destroy(userId, friendId),
    db.friends.destroy(friendId, userId),
  ])
}

function block(userId, friendId) {
  return Promise.all([
    db.friends.update(userId, friendId, { blocked: true }),
    db.friends.update(friendId, userId, { blockee: true }),
  ])
}

function unblock(userId, friendId) {
  return Promise.all([
    db.friends.update(userId, friendId, { blocked: false }),
    db.friends.update(friendId, userId, { blockee: false }),
  ])
}

function allUsers(userId, showBlocked) {
  return Promise.resolve().then(() => {
    return all(userId)
  }).then((friends) => {
    if( !showBlocked ) {
      friends = friends.filter((f) => {
        return !f.blocked
      })
    }

    if( !friends.length ) { return [] }

    return db.users.batchGet(friends.map((f) => {
      return f.friend_id
    }))
  })
}
