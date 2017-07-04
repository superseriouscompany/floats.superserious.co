module.exports = global.TEST_MODE && !process.env.LIVE ?
  require('./memory/friend_requests') :
  require('./dynamo/friend_requests');
