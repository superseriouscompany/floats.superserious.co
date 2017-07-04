'use strict';
const AWS         = require('aws-sdk');
const secrets     = require('./secrets');
let environment = process.env.NODE_ENV || 'development';

if( global.TEST_MODE ) {
  environment = 'test'
}
module.exports = Object.assign({
  baseUrl:                 'https://superserious.ngrok.io',
  awsRegion:               'eu-west-1',
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
}, require(`./${environment}`));

AWS.config.update({
  accessKeyId:     secrets.awsAccessKey,
  secretAccessKey: secrets.awsSecretKey,
  region:          module.exports.awsRegion,
});

module.exports.AWS = AWS;
