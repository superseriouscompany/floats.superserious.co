const config    = require('../../config');
const promisify = require('bluebird').Promise.promisify;
const client    = new config.AWS.DynamoDB.DocumentClient();
const lowLevel  = new config.AWS.DynamoDB();

client.get      = promisify(client.get, {context:      client});
client.delete   = promisify(client.delete, {context:   client});
client.put      = promisify(client.put, {context:      client});
client.query    = promisify(client.query, {context:    client});
client.scan     = promisify(client.scan, {context:     client});
client.update   = promisify(client.update, {context:   client});
client.batchGet = promisify(client.batchGet, {context: client});

client.truncate = function(tableName, schema) {
  return new Promise(function(resolve, reject) {
    lowLevel.deleteTable({ TableName: tableName }, function(err) {
      if( err && err.name != 'ResourceNotFoundException' ) { console.error(err.name); return reject(err); }

      waitForDeletion(tableName, function(err) {
        if( err ) { return reject(err); }

        lowLevel.createTable(schema, function(err) {
          if( err ) { return reject(err); }

          waitForCreation(tableName, function(err) {
            if( err ) { return reject(err); }
            resolve(true);
          })
        })
      })
    })
  })
}

function waitForDeletion(tableName, cb) {
  lowLevel.describeTable({
    TableName: tableName,
  }, function(err, cool) {
    if( !err ) {
      return setTimeout(function() {
        waitForDeletion(tableName, cb);
      }, 1000);
    }
    if( err.name != 'ResourceNotFoundException' ) {
      return cb(err);
    }
    cb();
  })
}

function waitForCreation(tableName, cb) {
  lowLevel.describeTable({
    TableName: tableName,
  }, function(err, data) {
    if( err ) { return cb(err); }
    if( data.Table.TableStatus != 'ACTIVE' ) {
      return setTimeout(function() {
        waitForCreation(tableName, cb);
      }, 1000);
    }
    cb();
  })
}

module.exports = client;
module.exports.lowLevel = new config.AWS.DynamoDB();
