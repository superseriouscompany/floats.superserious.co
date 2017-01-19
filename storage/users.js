module.exports = process.env.NODE_ENV == 'production' || process.env.LIVE ?
  require('./dynamo/users') :
  require('./memory/users');
