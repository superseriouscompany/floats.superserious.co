const config = require('../../../config');

module.exports = {
  "TableName": config.messagesTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"convo_id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"id",
      "AttributeType":"N"
    },
  ],
  "KeySchema":[
    {
      "AttributeName":"convo_id",
      "KeyType":"HASH",
    },
    {
      "AttributeName":"id",
      "KeyType":"RANGE",
    }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":5,
    "WriteCapacityUnits":5
  },
}
