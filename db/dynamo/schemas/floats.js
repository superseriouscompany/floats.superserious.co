const config = require('../../../config');

module.exports = {
  "TableName": config.floatsTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"user_id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"created_at",
      "AttributeType":"N"
    }
  ],
  "KeySchema":[
    {
      "AttributeName":"id",
      "KeyType":"HASH"
    },
  ],
  "GlobalSecondaryIndexes":[
    {
      "IndexName": "user_id",
      "KeySchema": [
        {
          "AttributeName": "user_id",
          "KeyType": "HASH",
        },
        {
          "AttributeName": "created_at",
          "KeyType": "RANGE",
        }
      ],
      "Projection": {
        "ProjectionType": "ALL",
      },
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5,
      }
    },
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":5,
    "WriteCapacityUnits":5
  },
}
