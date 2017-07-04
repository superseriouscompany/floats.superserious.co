const config = require('../../../config');

module.exports = {
  "TableName": config.pinsTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"user_id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"created_at",
      "AttributeType":"N"
    },
  ],
  "KeySchema":[
    {
      "AttributeName":"user_id",
      "KeyType":"HASH"
    },
    {
      "AttributeName":"created_at",
      "KeyType":"RANGE"
    },
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":1,
    "WriteCapacityUnits":5
  },
}
