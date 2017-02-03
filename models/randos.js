'use strict';

const db = {
  users: require('../db/users'),
}

module.exports = {
  all: all,
}

function all(exceptUserId) {
  return db.users.all().then((users) => {
    return users.sort((a,b) => {
      return a.created_at < b.created_at
    }).filter((u) => {
      return u.id != exceptUserId
    })
  })
}
