'use strict';

const config = require('../../config');
const client = require('./client');

module.exports = {
  batchCreate: batchCreate,
  findByUserId: findByUserId,
}

// FIXME: actually use batchPut
function batchCreate(members) {
  return Promise.all(members.map((m) => {
    return client.put({
      TableName: config.membersTableName,
      Item: m,
    });
  }))
}

function findByUserId(userId) {
  return client.query({
    TableName: config.membersTableName,
    KeyConditionExpression: 'user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': userId
    }
  }).then((results) => {
    return results.Items;
  })
}
