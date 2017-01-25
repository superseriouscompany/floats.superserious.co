const _       = require('lodash');
const client  = require('../client').lowLevel;
const schemas = require('./schemas');

_.values(schemas).forEach(function(schema) {
  client.createTable(schema, function(err) {
    if( err ) {
      if( err.code == 'ResourceInUseException' ) {
        return console.log(`${schema.TableName} already exists.`);
      }
      throw err;
    }
    console.log("Created", schema.TableName);
  })
});
