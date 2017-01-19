module.exports = process.env.NODE_ENV == 'production' || process.env.LIVE ?
  require('./dynamo/floats') :
  require('./memory/floats');
