'use strict';

const _       = require('lodash');
const fb      = require('../services/facebook');
const session = require('../services/session');
const uuid    = require('uuid');

const models = {
  friends: require('../models/friends'),
}
const db = {
  floats:          require('../db/floats'),
  users:           require('../db/users'),
  friend_requests: require('../db/friend_requests'),
}

module.exports = {
  createFromFacebook: createFromFacebook,
  get: get,
  update: update,
  destroy: destroy,
  findByFacebookIds: findByFacebookIds,
}

function createFromFacebook(facebookAccessToken) {
  let fbUser;
  const fields = ['id', 'access_token', 'name', 'avatar_url', 'created_at', 'username'];
  return fb.me(facebookAccessToken).then(function(fu) {
    fbUser = fu;
    return db.users.findByFacebookId(fbUser.id)
  }).then(function(user) {
    user = _.pick(user, fields);
    Object.defineProperty(user, 'metadata', {
      enumerable: false,
      writable: false,
      value: { existed: true }
    })

    return user;
  }).catch(function(err) {
    if( err.name == 'UserNotFound' ) {
      let user;
      return facebookCreate(facebookAccessToken, fbUser).then(function(u) {
        user = u;
        return session.create(user.access_token, user.id).then(() => {
          return _.pick(user, fields);
        })
      });
    }

    throw err;
  })
}

function findByFacebookIds(ids) {
  return db.users.all().then((users) => {
    return users.filter((u) => {
      return _.includes(ids, u.facebook_id)
    })
  })
}

function facebookCreate(fbToken, fbUser) {
  let user = Object.assign({}, fbUser, {
    facebook_id:           fbUser.id,
    facebook_access_token: fbToken,
    id:                    null,
    access_token:          uuid.v1(),
    avatar_url:            `https://graph.facebook.com/v2.8/${fbUser.id}/picture`,
  })
  return db.users.create(user);
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
      return db.friend_requests.destroy(f.user_id, userId);
    }))
  }).then(() => {
    return db.users.destroy(userId);
  })
}
