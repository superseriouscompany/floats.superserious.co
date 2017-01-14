const users = require('./users');

module.exports = {
  forUser: forUser,
}

function forUser(userId) {
  return users.all().filter(function(u) {
    return u.id != userId
  });
}
