const config = require('../../../config');

module.exports = {
  pins: {
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
  },

  users: {
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
        "AttributeType":"N"
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
}
