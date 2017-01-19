const users = require('./users');

module.exports = {
  all: all,
}

function all(userId) {
  return users.all().then(function(all) {
    return all.filter(function(u) {
      return u.id != userId
    });
  })
}
