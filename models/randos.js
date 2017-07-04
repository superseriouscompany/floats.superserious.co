'use strict';

const _ = require('lodash');
const db = {
  users:          require('../db/users'),
  friends:        require('../db/friends'),
  friendRequests: require('../db/friend_requests'),
}

module.exports = {
  all: all,
}

function all(userId) {
  let friends, friendRequests;

  return Promise.all([
    db.friends.all(userId),
    db.friendRequests.from(userId),
  ]).then((v) => {
    friends        = v[0];
    friendRequests = v[1];
    return db.users.all();
  }).then((users) => {
    return users.filter((u) => {
      if( u.id == userId ) { return false; }
      for( var i = 0; i < friends.length; i++ ) {
        if( friends[i].friend_id == u.id ) { return false; }
      }
      for( var i = 0; i < friendRequests.length; i++ ) {
        if( friendRequests[i].user_id == u.id ) { return false; }
      }
      return true;
    }).sort((a,b) => {
      return a.created_at < b.created_at
    })
  })
}
