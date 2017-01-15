module.exports = process.env.NODE_ENV == 'production' ?
  require('./dynamo/pins') :
  require('./memory/pins');
