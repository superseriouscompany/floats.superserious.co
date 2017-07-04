module.exports = global.TEST_MODE && !process.env.LIVE ?
  require('./memory/messages') :
  require('./dynamo/messages');
