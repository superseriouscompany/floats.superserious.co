const client  = require('../client');
const schemas = require('./schemas');

client.createTable(schemas.pins, function(err) {
  if( err ) {
    if( err.code == 'ResourceInUseException' ) {
      return console.log("Pins table already exists.");
    }
    throw err;
  }

  console.log("Created pins table.");
})
