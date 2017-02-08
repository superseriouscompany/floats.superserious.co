module.exports = true || global.TEST_MODE && !process.env.LIVE ?
  require('./memory/convos') :
  require('./dynamo/convos');
