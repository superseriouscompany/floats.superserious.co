'use strict';

const _     = require('lodash');
const error = require('../services/error');
const db = {
  floats:  require('../db/floats'),
  users:   require('../db/users'),
  convos:  require('../db/convos'),
  friends: require('../db/friends'),
  messages: require('../db/messages'),
}

module.exports = {
  create: create,
}

function create(user, title, inviteeIds) {
  let recipients, float;

  return db.friends.all(user.id).then(function(friends) {
    recipients = friends.filter(function(f) {
      return inviteeIds.indexOf(f.friend_id) !== -1;
    });
    if( recipients.length < inviteeIds.length ) {
      const badIds = _.differenceWith(recipients, inviteeIds, function(a, b) {
        return a.id == b;
      })
      throw error('Invalid invitees: not friends', {name: 'InvalidFriends', ids: badIds});
    }
    return db.floats.create({
      user_id:   user.id,
      title:     title,
      invitees:  recipients.map(function(r) { return r.id }),
      attendees: recipients.map((r) => { return _.pick(r, 'id', 'name', 'username', 'avatar_url')}),
      user:      _.pick(user, 'id', 'name', 'username', 'avatar_url'),
    })
  }).then(function(f) {
    float = f;
    const isGroupFloat = recipients.length > 1;

    const promises = recipients.map(function(r) {
      let convo;
      return db.convos.create(float.id, r.id, [user.id], [user, r])
    })


    if( isGroupFloat ) {
      const ids = _.map(recipients, 'id');
      promises.push(
        db.convos.create(float.id, user.id, ids, [user].concat(recipients))
      )
    }
    return Promise.all(promises);
  }).then(() => {
    Object.defineProperty(float, 'recipients', {
      enumerable: false,
      writable: false,
      value: recipients
    })
    return float;
  })
}
