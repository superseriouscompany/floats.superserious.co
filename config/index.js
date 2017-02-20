const AWS         = require('aws-sdk');
const secrets     = require('./secrets');
const environment = process.env.NODE_ENV || 'development';

module.exports = Object.assign({
  baseUrl:                 'https://superserious.ngrok.io',
  awsRegion:               'us-west-2',
  pinsTableName:           'pinsStaging',
  usersTableName:          'usersStaging',
  friendsTableName:        'friendsStaging',
  floatsTableName:         'floatsStaging',
  inviteesTableName:       'inviteesStaging',
  convosTableName:         'convosStaging',
  membersTableName:        'membersStaging',
  messagesTableName:       'messagesStaging',
  friendRequestsTableName: 'friendRequestsStaging',
  firebaseKey:             secrets.firebaseKey,
  dynamoEndpoint:          {endpoint: new AWS.Endpoint('http://localhost:8000')},
}, require(`./${environment}`));

AWS.config.update({
  accessKeyId:     secrets.awsAccessKey,
  secretAccessKey: secrets.awsSecretKey,
  region:          module.exports.awsRegion,
});

module.exports.AWS = AWS;
