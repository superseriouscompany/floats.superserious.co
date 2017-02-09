const config = require('../../../config');

module.exports = {
  "TableName": config.friendRequestsTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"rando_id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"user_id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"created_at",
      "AttributeType": "N"
    }
  ],
  "KeySchema":[
    {
      "AttributeName":"user_id",
      "KeyType":"HASH"
    },
    {
      "AttributeName":"rando_id",
      "KeyType":"RANGE"
    }
  ],
  "GlobalSecondaryIndexes":[
    {
      "IndexName": "created_at",
      "KeySchema": [
        {
          "AttributeName": "user_id",
          "KeyType": "HASH",
        },
        {
          "AttributeName": "created_at",
          "KeyType": "RANGE",
        },
      ],
      "Projection": {
        "ProjectionType": "ALL",
      },
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5,
      }
    },
    {
      "IndexName": "rando_id",
      "KeySchema": [
        {
          "AttributeName": "rando_id",
          "KeyType": "HASH"
        },
        {
          "AttributeName": "created_at",
          "KeyType": "RANGE"
        }
      ],
      "Projection": {
        "ProjectionType": "ALL",
      },
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5,
      },
    },
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":1,
    "WriteCapacityUnits":5
  },
}
