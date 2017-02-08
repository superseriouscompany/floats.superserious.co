const AWS         = require('aws-sdk');
const secrets     = require('./secrets');
const environment = process.env.NODE_ENV || 'development';

module.exports = Object.assign({
  baseUrl:          'https://superserious.ngrok.io',
  awsRegion:        'eu-west-1',
  pinsTableName:    'pinsStaging',
  usersTableName:   'usersStaging',
  friendsTableName: 'friendsStaging',
  floatsTableName:  'floatsStaging',
  membersTableName: 'membersStaging',
  firebaseKey:      secrets.firebaseKey,
}, require(`./${environment}`));

AWS.config.update({
  accessKeyId:     secrets.awsAccessKey,
  secretAccessKey: secrets.awsSecretKey,
  region:          module.exports.awsRegion,
});

module.exports.AWS = AWS;
