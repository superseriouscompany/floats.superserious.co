'use strict';

const config = require('../../config');
const client = require('./client');

module.exports = {
  batchCreate:  batchCreate,
  findByUserId: findByUserId,
  destroy:      destroy,
}

// TODO: actually use batchPut
function batchCreate(invitees) {
  return Promise.all(invitees.map((m) => {
    return client.put({
      TableName: config.inviteesTableName,
      Item: m,
    });
  }))
}

// TODO: add batchDestroy
function destroy(userId, floatId) {
  return client.delete({
    TableName: config.inviteesTableName,
    ConditionExpression: 'attribute_exists(user_id)',
    Key: { user_id: userId, float_id: floatId },
  }).then(function(ok) {
    return ok;
  }).catch(function(err) {
    if( err.name == 'ConditionalCheckFailedException' ) {
      throw error('No invitee found', {name: 'InviteeNotFound', userId: userId, floatId: floatId})
    }
    throw err;
  })
}

function findByUserId(userId) {
  return client.query({
    TableName: config.inviteesTableName,
    KeyConditionExpression: 'user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': userId
    }
  }).then((results) => {
    return results.Items;
  })
}
