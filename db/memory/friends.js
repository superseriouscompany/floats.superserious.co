'use strict';

const _     = require('lodash');
const users = require('../users');
const error = require('../../services/error');

module.exports = {
  all: all,
  create: create,
  update: update,
  get: get,
  destroy: destroy,
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
    friends[user.id].unshift({
      user_id:    user.id,
      friend_id:  rando.id,
      avatar_url: rando.avatar_url,
      name:       rando.name,
      created_at: +new Date,
    });
    return true;
  })
}

function destroy(userId, friendId) {
  friends[userId] = _.reject(friends[userId], (f) => {
    return f.friend_id == friendId
  })
}

function update(userId, friendId, values) {
  return Promise.resolve().then(() => {
    friends[userId] = friends[userId].map((f) => {
      if( f.friend_id == friendId ) {
        Object.assign(f, values);
      }
      return f;
    })
  })
}

function get(userId, friendId) {
  return Promise.resolve().then(function() {
    if( !friends[userId] ) {
      throw error('Friend not found', {name: 'FriendNotFound'});
    }
    return friends[userId]
  })
}
