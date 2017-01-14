const users = require('./users');

module.exports = {
  all: all,
}

function all(userId) {
  return users.all().filter(function(u) {
    return u.id != userId
  });
}
