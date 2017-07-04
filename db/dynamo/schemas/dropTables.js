const client  = require('../client').lowLevel;
const schemas = require('./schemas');
const _       = require('lodash');

if( process.env.NODE_ENV == 'production' ) {
  return console.error("Won't automatically drop all prod tables");
}

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
