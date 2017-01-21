const config    = require('../../config');
const promisify = require('bluebird').Promise.promisify;
const client    = new config.AWS.DynamoDB.DocumentClient();

client.put    = promisify(client.put, {context:    client});
client.query  = promisify(client.query, {context:  client});
client.get    = promisify(client.get, {context:    client});
client.scan   = promisify(client.scan, {context:   client});
client.update = promisify(client.update, {context: client});

module.exports = client;
module.exports.lowLevel = new config.AWS.DynamoDB();
