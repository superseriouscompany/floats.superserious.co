module.exports = global.TEST_MODE && !process.env.LIVE ?
  require('./memory/floats') :
  require('./dynamo/floats');
