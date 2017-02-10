'use strict';

const client = require('../client');
const db = {
  users: require('../users'),
  friendRequests: require('../friend_requests'),
  friends: require('../friends'),
}


if( !process.env.ID ) { console.log('Usage: ID=123-456 node repairAvatarUrls'); }

const id = process.env.ID;

let avatarUrl;
db.users.get(id).then((u) => {
  avatarUrl = `https://graph.facebook.com/v2.8/${u.facebook_id}/picture`
  console.log(`Repairing avatar url for ${u.name} to ${avatarUrl}`);
})
