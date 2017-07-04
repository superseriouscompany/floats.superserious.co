const config = require('../../../config');

module.exports = {
  "TableName": config.usersTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"access_token",
      "AttributeType":"S"
    },
    {
      "AttributeName":"facebook_id",
      "AttributeType":"S"
    },
  ],
  "KeySchema":[
    {
      "AttributeName":"id",
      "KeyType":"HASH"
    },
  ],
  "GlobalSecondaryIndexes":[
    {
      "IndexName": "access_token",
      "KeySchema": [
        {
          "AttributeName": "access_token",
          "KeyType": "HASH",
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
      "IndexName": "facebook_id",
      "KeySchema": [
        {
          "AttributeName": "facebook_id",
          "KeyType": "HASH",
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
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":5,
    "WriteCapacityUnits":5
  },
}
