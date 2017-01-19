module.exports = process.env.NODE_ENV == 'production' || process.env.LIVE ?
  require('./dynamo/pins') :
  require('./memory/pins');
