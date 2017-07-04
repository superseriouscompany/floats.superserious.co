const config = require('../../../config');

module.exports = {
  "TableName": config.membersTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"user_id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"convo_id",
      "AttributeType":"S"
    },
  ],
  "KeySchema":[
    {
      "AttributeName":"user_id",
      "KeyType":"HASH",
    },
    {
      "AttributeName":"convo_id",
      "KeyType":"RANGE",
    }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":5,
    "WriteCapacityUnits":5
  },
}
