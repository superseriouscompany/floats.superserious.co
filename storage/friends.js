module.exports = false ?
  require('./dynamo/friends') :
  require('./memory/friends');
