module.exports = global.TEST_MODE && !process.env.LIVE ?
  require('./memory/friends') :
  require('./dynamo/friends');
