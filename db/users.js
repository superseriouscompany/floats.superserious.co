module.exports = global.TEST_MODE && !process.env.LIVE ?
  require('./memory/users') :
  require('./dynamo/users');
