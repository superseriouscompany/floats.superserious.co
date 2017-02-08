const config = require('../../../config');

module.exports = {
  "TableName": config.membersTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"user_id",
      "AttributeType":"S"
    },
  ],
  "KeySchema":[
    {
      "AttributeName":"user_id",
      "KeyType":"HASH"
    },
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":5,
    "WriteCapacityUnits":5
  },
}
