const config = require('../../../config');

module.exports = {
  "TableName": config.convosTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"float_id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"created_at",
      "AttributeType":"N"
    },
  ],
  "KeySchema":[
    {
      "AttributeName":"float_id",
      "KeyType":"HASH"
    },
    {
      "AttributeName": "id",
      "KeyType":"RANGE"
    }
  ],
  "GlobalSecondaryIndexes":[
    {
      "IndexName": "created_at",
      "KeySchema": [
        {
          "AttributeName": "float_id",
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
