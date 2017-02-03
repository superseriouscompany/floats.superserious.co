module.exports = false ?
  require('./dynamo/friend_requests') :
  require('./memory/friend_requests');
