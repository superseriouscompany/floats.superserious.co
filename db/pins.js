module.exports = global.TEST_MODE && !process.env.LIVE ?
  require('./memory/pins') :
  require('./dynamo/pins');
