'use strict';

const _ = require('lodash');
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
      return inviteeIds.indexOf(f.id) !== -1;
    });
    if( recipients.length < inviteeIds.length ) {
      const badIds = _.differenceWith(inviteeIds, recipients, function(a, b) {
        return a == b.id;
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
      return db.convos.create(float.id, r.id, [user.id], [user, r]).then(function(c) {
        convo = c;
        if( isGroupFloat ) { return true; }
        return db.messages.create(
          float.id,
          c.id,
          user.id,
          float.title
        )
      }).then(function(m) {
        if( isGroupFloat ) { return true; }
        return db.convos.setLastMessage(float.id, convo.id, m);
      });
    })

    const ids = _.map(recipients, 'id');

    if( isGroupFloat ) {
      promises.push(
        db.convos.create(float.id, user.id, ids, [user].concat(recipients)).then(function(c) {
          return db.messages.create(
            float.id,
            c.id,
            user.id,
            float.title
          ).then(function(m) {
            return db.convos.setLastMessage(float.id, c.id, m);
          })
        })
      )
    }
    return Promise.all(promises);
  }).then(() => {
    return {
      float: float,
      recipients: recipients,
    }
  })
}
