'use strict';

const fb = require('../services/facebook');
const models = {
  friends: require('../models/friends'),
}
const db = {
  floats:          require('../db/floats'),
  users:           require('../db/users'),
  friend_requests: require('../db/friend_requests'),
}

module.exports = {
  destroy: destroy,
}

function destroy(userId) {
  return Promise.resolve().then(() => {
    return db.floats.findByCreator(userId)
  }).then((floats) => {
    return Promise.all(floats.map((f) => {
      return db.floats.destroy(f.id)
    }))
  }).then(() => {
    return db.floats.findByInvitee(userId)
  }).then((floats) => {
    return Promise.all(floats.map((f) => {
      return db.floats.leave(f.id, userId);
    }))
  }).then(() => {
    return models.friends.all(userId)
  }).then((friends) => {
    return Promise.all(friends.map((f) => {
      return models.friends.destroy(userId, f.friend_id)
    }))
  }).then(() => {
    return db.friend_requests.from(userId)
  }).then((friendRequests) => {
    return Promise.all(friendRequests.map((f) => {
      return db.friend_requests.destroy(f.user.id, userId);
    }))
  }).then(() => {
    return db.users.destroy(userId);
  })
}
