const config = require('../../../config');

module.exports = {
  "TableName": config.inviteesTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"user_id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"float_id",
      "AttributeType":"S"
    },
  ],
  "KeySchema":[
    {
      "AttributeName":"user_id",
      "KeyType":"HASH",
    },
    {
      "AttributeName":"float_id",
      "KeyType":"RANGE",
    }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":5,
    "WriteCapacityUnits":5
  },
}
