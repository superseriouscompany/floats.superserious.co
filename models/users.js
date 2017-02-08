'use strict';

const _  = require('lodash');
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
  get: get,
  update: update,
  destroy: destroy,
}

function get(id, profile) {
  return db.users.get(id).then((user) => {
    if( profile == 'limited' ) {
      user.hasFirebaseToken = !!user.firebase_token;
      user = _.pick(user, 'id', 'name', 'avatar_url', 'created_at', 'username', 'hasFirebaseToken');
    }
    return user;
  })
}

function update(userId, fields) {
  fields = _.pick(fields, 'name', 'username', 'firebase_token');
  return db.users.update(userId, fields)
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
