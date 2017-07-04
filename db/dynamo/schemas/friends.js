const config = require('../../../config');

module.exports = {
  "TableName": config.friendsTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"user_id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"friend_id",
      "AttributeType":"S"
    },
  ],
  "KeySchema":[
    {
      "AttributeName":"user_id",
      "KeyType":"HASH"
    },
    {
      "AttributeName":"friend_id",
      "KeyType":"RANGE"
    }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":5,
    "WriteCapacityUnits":5
  },
}
