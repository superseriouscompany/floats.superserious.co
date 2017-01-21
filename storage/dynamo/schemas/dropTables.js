const client  = require('../client').lowLevel;
const schemas = require('./schemas');
const _       = require('lodash');

_.map(_.values(schemas), 'TableName').forEach(function(tableName) {
  client.deleteTable({TableName: tableName}, function(err, ok) {
    if( err ) {
      if( err.name == 'ResourceNotFoundException' ) {
        return console.log(tableName, "does not exist");
      }
      throw err;
    }
    console.log("Deleted", tableName);
  })
});
